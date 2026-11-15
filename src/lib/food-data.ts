export interface RawMaterial {
    id: string;
    name: string;
    ykzRate: number;
    mlbRate: number;
    weight: number; // in kg per piece
}

export interface IngredientRequirement {
    materialId: string;
    quantity: number;
}

export interface MenuItem {
    id: string;
    name: string;
    category: 'Food' | 'Beverage' | 'Component';
    batchSize: number;
    ingredients: IngredientRequirement[];
    prepTime: string;
    finishedWeight?: number; // per batch
}

export const RAW_MATERIALS: Record<string, RawMaterial> = {
    flour_tortilla: { id: 'flour_tortilla', name: 'Flour Tortilla', ykzRate: 1250, mlbRate: 1250, weight: 0.05 },
    rice: { id: 'rice', name: 'Rice', ykzRate: 2000, mlbRate: 2000, weight: 0.1 },
    kidney_beans: { id: 'kidney_beans', name: 'Kidney Beans', ykzRate: 1500, mlbRate: 1500, weight: 0.1 },
    raw_ground_beef: { id: 'raw_ground_beef', name: 'Raw Ground Beef', ykzRate: 3000, mlbRate: 3000, weight: 0.2 },
    block_cheese: { id: 'block_cheese', name: 'Block Cheese', ykzRate: 125, mlbRate: 125, weight: 0.15 },
    coffee_beans: { id: 'coffee_beans', name: 'Coffee Beans', ykzRate: 2000, mlbRate: 2000, weight: 0.05 },
    cream_cheese: { id: 'cream_cheese', name: 'Cream Cheese', ykzRate: 2200, mlbRate: 2200, weight: 0.1 },
    eggs: { id: 'eggs', name: 'Eggs', ykzRate: 1563, mlbRate: 1560, weight: 0.05 },
    sugar: { id: 'sugar', name: 'Sugar', ykzRate: 1250, mlbRate: 1250, weight: 0.1 },
    chocolate: { id: 'chocolate', name: 'Chocolate', ykzRate: 1800, mlbRate: 1800, weight: 0.05 },
    thai_tea_leaves: { id: 'thai_tea_leaves', name: 'Thai Tea Leaves', ykzRate: 2000, mlbRate: 2000, weight: 0.05 },
    condensed_milk: { id: 'condensed_milk', name: 'Condensed Milk', ykzRate: 1600, mlbRate: 1600, weight: 0.1 },
    ice: { id: 'ice', name: 'Ice', ykzRate: 500, mlbRate: 500, weight: 0.05 },
    paper_cup: { id: 'paper_cup', name: 'Paper Cup', ykzRate: 937.5, mlbRate: 930, weight: 0.0125 },
    black_tea: { id: 'black_tea', name: 'Black Tea', ykzRate: 125, mlbRate: 125, weight: 0.05 },
    milk: { id: 'milk', name: 'Milk', ykzRate: 1563, mlbRate: 1560, weight: 0.2 },
    cinnamon_stick: { id: 'cinnamon_stick', name: 'Cinnamon Stick', ykzRate: 1000, mlbRate: 1000, weight: 0.02 },
    fresh_ginger: { id: 'fresh_ginger', name: 'Fresh Ginger', ykzRate: 1000, mlbRate: 1000, weight: 0.05 },
    pineapple: { id: 'pineapple', name: 'Pineapple', ykzRate: 1500, mlbRate: 1500, weight: 0.2 },
    coconut_cream: { id: 'coconut_cream', name: 'Coconut Cream', ykzRate: 1800, mlbRate: 1800, weight: 0.15 },
    glass_cup: { id: 'glass_cup', name: 'Glass Cup', ykzRate: 1563, mlbRate: 1560, weight: 0.1 },
    lemon: { id: 'lemon', name: 'Lemon', ykzRate: 1200, mlbRate: 1200, weight: 0.05 },
    fresh_mint: { id: 'fresh_mint', name: 'Fresh Mint', ykzRate: 625, mlbRate: 620, weight: 0.025 },
    carbonated_water: { id: 'carbonated_water', name: 'Carbonated Water', ykzRate: 120, mlbRate: 120, weight: 0.1 },
    lettuce: { id: 'lettuce', name: 'Lettuce', ykzRate: 1250, mlbRate: 1250, weight: 0.1 },
    tomato: { id: 'tomato', name: 'Tomato', ykzRate: 938, mlbRate: 930, weight: 0.1 },
    sushi_rice: { id: 'sushi_rice', name: 'Sushi Rice', ykzRate: 2500, mlbRate: 2500, weight: 0.1 },
    nori_sheets: { id: 'nori_sheets', name: 'Nori Sheets', ykzRate: 1875, mlbRate: 1875, weight: 0.033 },
    raw_salmon_fillet: { id: 'raw_salmon_fillet', name: 'Raw Salmon Fillet', ykzRate: 4000, mlbRate: 4000, weight: 0.2 },
    raw_tuna_steak: { id: 'raw_tuna_steak', name: 'Raw Tuna Steak', ykzRate: 4500, mlbRate: 4500, weight: 0.2 },
    avocado: { id: 'avocado', name: 'Avocado', ykzRate: 120, mlbRate: 120, weight: 0.1 },
    alfredo_sauce: { id: 'alfredo_sauce', name: 'Alfredo Sauce', ykzRate: 100, mlbRate: 100, weight: 0.1 },
    beef_broth: { id: 'beef_broth', name: 'Beef Broth', ykzRate: 75, mlbRate: 75, weight: 0.1 },
    burger_bun: { id: 'burger_bun', name: 'Burger Bun', ykzRate: 75, mlbRate: 75, weight: 0.05 },
    butter: { id: 'butter', name: 'Butter', ykzRate: 110, mlbRate: 110, weight: 0.05 },
};

export const MENU_ITEMS: MenuItem[] = [
    {
        id: 'missio_style_burrito',
        name: 'Missio Style burrito',
        category: 'Food',
        batchSize: 19,
        prepTime: '41s',
        finishedWeight: 4.5,
        ingredients: [
            { materialId: 'flour_tortilla', quantity: 19 },
            { materialId: 'rice', quantity: 19 },
            { materialId: 'kidney_beans', quantity: 19 },
            { materialId: 'raw_ground_beef', quantity: 19 },
            { materialId: 'block_cheese', quantity: 19 },
        ]
    },
    {
        id: 'italian_tiramisu',
        name: 'Italian tiramisu',
        category: 'Food',
        batchSize: 6,
        prepTime: '36s',
        finishedWeight: 1.5,
        ingredients: [
            { materialId: 'coffee_beans', quantity: 6 },
            { materialId: 'cream_cheese', quantity: 6 },
            { materialId: 'eggs', quantity: 6 },
            { materialId: 'sugar', quantity: 6 },
            { materialId: 'chocolate', quantity: 6 },
        ]
    },
    {
        id: 'beef_taco',
        name: 'Beef Taco',
        category: 'Food',
        batchSize: 11,
        prepTime: '32s',
        finishedWeight: 2.2,
        ingredients: [
            { materialId: 'flour_tortilla', quantity: 11 },
            { materialId: 'raw_ground_beef', quantity: 11 },
            { materialId: 'lettuce', quantity: 11 },
            { materialId: 'tomato', quantity: 11 },
        ]
    },
    {
        id: 'sushi_tray',
        name: 'Sushi Tray',
        category: 'Food',
        batchSize: 11,
        prepTime: '45s',
        finishedWeight: 2.8,
        ingredients: [
            { materialId: 'sushi_rice', quantity: 11 },
            { materialId: 'nori_sheets', quantity: 11 },
            { materialId: 'raw_salmon_fillet', quantity: 11 },
            { materialId: 'raw_tuna_steak', quantity: 11 },
            { materialId: 'avocado', quantity: 11 },
        ]
    },
    {
        id: 'lemon_mint_cooler_glass',
        name: 'Lemon mint cooler glass',
        category: 'Beverage',
        batchSize: 13,
        prepTime: '30s',
        finishedWeight: 2.6,
        ingredients: [
            { materialId: 'lemon', quantity: 13 },
            { materialId: 'fresh_mint', quantity: 13 },
            { materialId: 'sugar', quantity: 13 },
            { materialId: 'carbonated_water', quantity: 13 },
            { materialId: 'glass_cup', quantity: 13 },
        ]
    },
    {
        id: 'pina_colada',
        name: 'Pina Colada',
        category: 'Beverage',
        batchSize: 20,
        prepTime: '33s',
        finishedWeight: 4.0,
        ingredients: [
            { materialId: 'pineapple', quantity: 20 },
            { materialId: 'coconut_cream', quantity: 20 },
            { materialId: 'ice', quantity: 20 },
            { materialId: 'glass_cup', quantity: 20 },
        ]
    },
    {
        id: 'thai_ice_tea',
        name: 'Thai Ice Tea',
        category: 'Beverage',
        batchSize: 12,
        prepTime: '32s',
        finishedWeight: 2.4,
        ingredients: [
            { materialId: 'thai_tea_leaves', quantity: 12 },
            { materialId: 'condensed_milk', quantity: 12 },
            { materialId: 'ice', quantity: 12 },
            { materialId: 'paper_cup', quantity: 12 },
        ]
    },
    {
        id: 'masala_chai',
        name: 'Masala Chai',
        category: 'Beverage',
        batchSize: 10,
        prepTime: '38s',
        finishedWeight: 2.0,
        ingredients: [
            { materialId: 'black_tea', quantity: 10 },
            { materialId: 'milk', quantity: 10 },
            { materialId: 'cinnamon_stick', quantity: 10 },
            { materialId: 'fresh_ginger', quantity: 10 },
            { materialId: 'paper_cup', quantity: 10 },
        ]
    },
    {
        id: 'icedlatte_capped',
        name: 'Icedlatte Capped',
        category: 'Beverage',
        batchSize: 10,
        prepTime: '30s',
        finishedWeight: 2.0,
        ingredients: [
            { materialId: 'coffee_beans', quantity: 10 },
            { materialId: 'milk', quantity: 10 },
            { materialId: 'ice', quantity: 10 },
            { materialId: 'paper_cup', quantity: 10 },
        ]
    },
    {
        id: 'frappe_coffee',
        name: 'Frappe Coffee',
        category: 'Beverage',
        batchSize: 9,
        prepTime: '35s',
        finishedWeight: 1.8,
        ingredients: [
            { materialId: 'coffee_beans', quantity: 9 },
            { materialId: 'milk', quantity: 9 },
            { materialId: 'sugar', quantity: 9 },
            { materialId: 'ice', quantity: 9 },
            { materialId: 'paper_cup', quantity: 9 },
        ]
    }
];

export function calculateRequirements(
    selectedItems: { id: string; targetQuantity: number }[],
    livePrices?: { ykz: Record<string, number>, mlb: Record<string, number> },
    customMenuItems?: MenuItem[],
    customRawMaterials?: Record<string, RawMaterial>
) {
    const activeMenuItems = customMenuItems && customMenuItems.length > 0 ? customMenuItems : MENU_ITEMS;
    const activeMaterials = customRawMaterials && Object.keys(customRawMaterials).length > 0 ? customRawMaterials : RAW_MATERIALS;
    const rawRequirements: Record<string, { materialId: string; quantity: number; weight: number; ykzCost: number; mlbCost: number }> = {};

    selectedItems.forEach(item => {
        const menuItem = activeMenuItems.find(m => m.id === item.id);
        if (!menuItem) return;

        const batchSize = Math.max(1, menuItem.batchSize || 1);
        const batches = Math.ceil(item.targetQuantity / batchSize);

        menuItem.ingredients.forEach(ing => {
            const material = activeMaterials[ing.materialId] || Object.values(activeMaterials).find(m => m.id === ing.materialId || m.name.toLowerCase() === ing.materialId.toLowerCase());
            if (!material) return;

            const neededQty = ing.quantity * batches;
            const weight = (material.weight || 0.1) * neededQty;
            
            const ykzRate = livePrices?.ykz?.[material.name] ?? material.ykzRate;
            const mlbRate = livePrices?.mlb?.[material.name] ?? material.mlbRate;

            const ykzCost = ykzRate * neededQty;
            const mlbCost = mlbRate * neededQty;

            const key = material.id || ing.materialId;
            if (rawRequirements[key]) {
                rawRequirements[key].quantity += neededQty;
                rawRequirements[key].weight += weight;
                rawRequirements[key].ykzCost += ykzCost;
                rawRequirements[key].mlbCost += mlbCost;
            } else {
                rawRequirements[key] = {
                    materialId: key,
                    quantity: neededQty,
                    weight,
                    ykzCost,
                    mlbCost
                };
            }
        });
    });

    return Object.values(rawRequirements);
}
