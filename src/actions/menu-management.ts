'use server';

import connectToDatabase from '@/lib/db';
import MenuItem, { IMenuItem } from '@/models/MenuItem';
import RawMaterial, { IRawMaterial } from '@/models/RawMaterial';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { SET_A_MENU_ITEMS } from '@/data/menuData';
import { MENU_ITEMS as STATIC_RECIPES, RAW_MATERIALS as STATIC_RAW_MATERIALS } from '@/lib/food-data';

/**
 * Verify whether the current logged-in user possesses a Major Role (Admin or Bulkhead)
 */
async function verifyMajorRole() {
    const session = await auth();
    if (!session?.user) {
        return { authorized: false, error: 'Authentication required. Please log in.' };
    }

    const role = (session.user as any).role || '';
    const isMajorRole = role === 'admin' || role === 'bulkhead';

    if (!isMajorRole) {
        return {
            authorized: false,
            error: 'Access Denied: Only Major Roles (Admin & Bulkhead / Management) can modify the menu and ingredients.'
        };
    }

    return { authorized: true, user: session.user };
}

/**
 * Helper to assign reasonable categories to default raw materials
 */
function getMaterialCategory(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('beef') || lower.includes('chicken') || lower.includes('meat') || lower.includes('pork') || lower.includes('tuna') || lower.includes('salmon')) {
        return 'Meat & Seafood';
    }
    if (lower.includes('cheese') || lower.includes('egg') || lower.includes('milk') || lower.includes('cream')) {
        return 'Dairy & Eggs';
    }
    if (lower.includes('tortilla') || lower.includes('bun') || lower.includes('noodle') || lower.includes('rice') || lower.includes('batter') || lower.includes('potato') || lower.includes('nori')) {
        return 'Grains & Bakery';
    }
    if (lower.includes('lettuce') || lower.includes('tomato') || lower.includes('avocado') || lower.includes('lemon') || lower.includes('mint') || lower.includes('ginger') || lower.includes('pineapple') || lower.includes('bean')) {
        return 'Produce & Herbs';
    }
    if (lower.includes('tea') || lower.includes('coffee') || lower.includes('water') || lower.includes('cup') || lower.includes('ice')) {
        return 'Beverage Supplies';
    }
    return 'Pantry & Seasonings';
}

/**
 * Seeds MongoDB with the default 31 Raw Materials and 20 Menu Items if empty
 */
async function seedDefaultsIfEmpty() {
    await connectToDatabase();

    const [materialCount, menuCount] = await Promise.all([
        RawMaterial.countDocuments(),
        MenuItem.countDocuments()
    ]);

    // 1. Seed Raw Materials if none exist
    if (materialCount === 0) {
        console.log('[MenuManagement] Seeding initial Raw Materials into MongoDB...');
        const materialsToInsert = Object.values(STATIC_RAW_MATERIALS).map((rm) => ({
            id: rm.id,
            name: rm.name,
            category: getMaterialCategory(rm.name),
            ykzRate: rm.ykzRate,
            mlbRate: rm.mlbRate,
            weight: rm.weight || 0.1,
            unit: 'per unit',
            station: 'Kitchen'
        }));

        if (materialsToInsert.length > 0) {
            await RawMaterial.insertMany(materialsToInsert);
        }
    }

    // 2. Seed Menu Items if none exist
    if (menuCount === 0) {
        console.log('[MenuManagement] Seeding initial Menu Items into MongoDB...');
        const itemsToInsert = SET_A_MENU_ITEMS.map((dish) => {
            // Find corresponding static recipe if exists
            const recipe = STATIC_RECIPES.find(
                (r) => r.id === dish.id || r.name.toLowerCase() === dish.name.toLowerCase()
            );

            const ingredients = recipe
                ? recipe.ingredients.map((ing) => {
                    const mat = STATIC_RAW_MATERIALS[ing.materialId];
                    return {
                        materialId: ing.materialId,
                        materialName: mat ? mat.name : ing.materialId,
                        quantity: ing.quantity
                    };
                })
                : [];

            const isDrink = dish.station === 'beverage' || dish.statType === 'thirst';
            const category = dish.tag || (isDrink ? 'Beverages' : 'Mains');

            return {
                id: dish.id,
                name: dish.name,
                category,
                type: (isDrink ? 'Beverage' : 'Food') as 'Food' | 'Beverage',
                price: dish.price,
                batchSize: recipe ? recipe.batchSize : 5,
                prepTime: recipe ? recipe.prepTime : '35s',
                description: dish.description || '',
                imageUrl: dish.image || '',
                station: dish.stationLabel || dish.station || 'Kitchen',
                hunger: dish.statType === 'hunger' ? dish.statValue : 0,
                thirst: dish.statType === 'thirst' ? dish.statValue : 0,
                isPopular: false,
                isAvailable: true,
                setGroup: 'set_a' as const,
                ingredients
            };
        });

        if (itemsToInsert.length > 0) {
            await MenuItem.insertMany(itemsToInsert);
        }
    }
}

/**
 * Fetch all menu items and raw materials.
 * Also returns `canEdit` indicating whether the caller has a Major Role.
 */
export async function getMenuAndIngredients() {
    try {
        await connectToDatabase();
        await seedDefaultsIfEmpty();

        const session = await auth();
        const role = (session?.user as any)?.role || '';
        const canEdit = role === 'admin' || role === 'bulkhead';

        const [menuItems, rawMaterials] = await Promise.all([
            MenuItem.find({}).sort({ category: 1, name: 1 }).lean(),
            RawMaterial.find({}).sort({ category: 1, name: 1 }).lean()
        ]);

        return {
            success: true,
            canEdit,
            userRole: role,
            menuItems: JSON.parse(JSON.stringify(menuItems)),
            rawMaterials: JSON.parse(JSON.stringify(rawMaterials))
        };
    } catch (error: any) {
        console.error('[MenuManagement] Failed to get menu and ingredients:', error);
        return {
            success: false,
            canEdit: false,
            userRole: 'guest',
            menuItems: [],
            rawMaterials: [],
            error: error?.message || 'Failed to fetch menu data'
        };
    }
}

/**
 * Create or update a Menu Item (Dishes & Recipes).
 * Restricted to Major Roles (Admin & Bulkhead).
 */
export async function saveMenuItem(data: {
    id?: string;
    name: string;
    category: string;
    type?: 'Food' | 'Beverage' | 'Component';
    price: number;
    batchSize: number;
    prepTime?: string;
    description?: string;
    imageUrl?: string;
    station?: string;
    hunger?: number;
    thirst?: number;
    isPopular?: boolean;
    isAvailable?: boolean;
    setGroup?: 'set_a' | 'set_b' | 'signatures';
    ingredients: Array<{ materialId: string; materialName: string; quantity: number }>;
}) {
    const authCheck = await verifyMajorRole();
    if (!authCheck.authorized) {
        return { success: false, error: authCheck.error };
    }

    if (!data.name?.trim()) {
        return { success: false, error: 'Dish name is required.' };
    }

    try {
        await connectToDatabase();

        const slugId = data.id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

        const updatePayload = {
            id: slugId,
            name: data.name.trim(),
            category: data.category || 'Mains',
            type: data.type || (data.category === 'Beverages' ? 'Beverage' : 'Food'),
            price: Number(data.price) || 0,
            batchSize: Math.max(1, Number(data.batchSize) || 1),
            prepTime: data.prepTime?.trim() || '30s',
            description: data.description?.trim() || '',
            imageUrl: data.imageUrl?.trim() || '',
            station: data.station || 'Kitchen',
            hunger: Number(data.hunger) || 0,
            thirst: Number(data.thirst) || 0,
            isPopular: !!data.isPopular,
            isAvailable: data.isAvailable !== false,
            setGroup: data.setGroup || 'set_a',
            ingredients: (data.ingredients || []).map((ing) => ({
                materialId: ing.materialId,
                materialName: ing.materialName,
                quantity: Math.max(1, Number(ing.quantity) || 1)
            }))
        };

        const item = await MenuItem.findOneAndUpdate(
            { id: slugId },
            { $set: updatePayload },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        revalidatePath('/dashboard');
        revalidatePath('/portal/dashboard');
        revalidatePath('/koi-cafe');
        revalidatePath('/gm-cafe');
        revalidatePath('/');

        return {
            success: true,
            message: `Menu item "${updatePayload.name}" saved successfully!`,
            item: JSON.parse(JSON.stringify(item))
        };
    } catch (error: any) {
        console.error('[MenuManagement] Failed to save menu item:', error);
        return { success: false, error: error?.message || 'Database error saving menu item' };
    }
}

/**
 * Delete a Menu Item.
 * Restricted to Major Roles (Admin & Bulkhead).
 */
export async function deleteMenuItem(id: string) {
    const authCheck = await verifyMajorRole();
    if (!authCheck.authorized) {
        return { success: false, error: authCheck.error };
    }

    try {
        await connectToDatabase();
        const deleted = await MenuItem.findOneAndDelete({ id });

        if (!deleted) {
            return { success: false, error: 'Item not found.' };
        }

        revalidatePath('/dashboard');
        revalidatePath('/portal/dashboard');
        revalidatePath('/koi-cafe');
        revalidatePath('/gm-cafe');
        revalidatePath('/');

        return { success: true, message: `Menu item "${deleted.name}" deleted successfully.` };
    } catch (error: any) {
        console.error('[MenuManagement] Failed to delete menu item:', error);
        return { success: false, error: error?.message || 'Failed to delete menu item' };
    }
}

/**
 * Create or update a Raw Material / Ingredient.
 * Restricted to Major Roles (Admin & Bulkhead).
 */
export async function saveRawMaterial(data: {
    id?: string;
    name: string;
    category?: string;
    ykzRate: number;
    mlbRate: number;
    weight?: number;
    unit?: string;
    station?: string;
}) {
    const authCheck = await verifyMajorRole();
    if (!authCheck.authorized) {
        return { success: false, error: authCheck.error };
    }

    if (!data.name?.trim()) {
        return { success: false, error: 'Ingredient name is required.' };
    }

    try {
        await connectToDatabase();

        const slugId = data.id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

        const updatePayload = {
            id: slugId,
            name: data.name.trim(),
            category: data.category || getMaterialCategory(data.name),
            ykzRate: Number(data.ykzRate) || 0,
            mlbRate: Number(data.mlbRate) || 0,
            weight: Number(data.weight) || 0.1,
            unit: data.unit || 'per unit',
            station: data.station || 'Kitchen'
        };

        const material = await RawMaterial.findOneAndUpdate(
            { id: slugId },
            { $set: updatePayload },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        revalidatePath('/dashboard');
        revalidatePath('/portal/dashboard');

        return {
            success: true,
            message: `Ingredient "${updatePayload.name}" saved successfully!`,
            material: JSON.parse(JSON.stringify(material))
        };
    } catch (error: any) {
        console.error('[MenuManagement] Failed to save raw material:', error);
        return { success: false, error: error?.message || 'Database error saving ingredient' };
    }
}

/**
 * Delete a Raw Material / Ingredient.
 * Restricted to Major Roles (Admin & Bulkhead).
 */
export async function deleteRawMaterial(id: string) {
    const authCheck = await verifyMajorRole();
    if (!authCheck.authorized) {
        return { success: false, error: authCheck.error };
    }

    try {
        await connectToDatabase();

        // Check if any active menu items depend on this ingredient
        const dependentItems = await MenuItem.find({ 'ingredients.materialId': id }).select('name').lean();
        if (dependentItems.length > 0) {
            const dishNames = dependentItems.map((d: any) => d.name).slice(0, 3).join(', ');
            return {
                success: false,
                error: `Cannot delete ingredient: It is currently used in recipes for: ${dishNames}${dependentItems.length > 3 ? '...' : ''}. Please remove it from those recipes first.`
            };
        }

        const deleted = await RawMaterial.findOneAndDelete({ id });
        if (!deleted) {
            return { success: false, error: 'Ingredient not found.' };
        }

        revalidatePath('/dashboard');
        revalidatePath('/portal/dashboard');

        return { success: true, message: `Ingredient "${deleted.name}" deleted successfully.` };
    } catch (error: any) {
        console.error('[MenuManagement] Failed to delete raw material:', error);
        return { success: false, error: error?.message || 'Failed to delete ingredient' };
    }
}

/**
 * Reset Menu and Ingredients back to original Set A defaults.
 * Restricted strictly to Admin.
 */
export async function resetMenuToDefaults() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
        return { success: false, error: 'Only an Admin can reset the menu to defaults.' };
    }

    try {
        await connectToDatabase();
        await Promise.all([
            MenuItem.deleteMany({}),
            RawMaterial.deleteMany({})
        ]);

        await seedDefaultsIfEmpty();

        revalidatePath('/dashboard');
        revalidatePath('/portal/dashboard');
        revalidatePath('/koi-cafe');
        revalidatePath('/gm-cafe');
        revalidatePath('/');

        return { success: true, message: 'Menu and Ingredients successfully reset to factory defaults!' };
    } catch (error: any) {
        console.error('[MenuManagement] Reset error:', error);
        return { success: false, error: error?.message || 'Failed to reset menu' };
    }
}
