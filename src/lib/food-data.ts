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
    pork_rib: { id: 'pork_rib', name: 'Raw Pork Rib', ykzRate: 2813, mlbRate: 2800, weight: 0.4 },
    shrimp: { id: 'shrimp', name: 'Raw Shrimp', ykzRate: 7813, mlbRate: 7800, weight: 0.1 },
    chashu_pork: { id: 'chashu_pork', name: 'Chashu Pork', ykzRate: 3438, mlbRate: 3430, weight: 0.1 },
    pork_broth: { id: 'pork_broth', name: 'Pork Broth', ykzRate: 2375, mlbRate: 2370, weight: 0.2 },
    bbq_sauce: { id: 'bbq_sauce', name: 'BBQ Sauce', ykzRate: 1250, mlbRate: 1250, weight: 0.1 },
    egg: { id: 'egg', name: 'Egg', ykzRate: 1563, mlbRate: 1560, weight: 0.05 },
    tomato: { id: 'tomato', name: 'Tomato', ykzRate: 938, mlbRate: 930, weight: 0.1 },
    lettuce: { id: 'lettuce', name: 'Lettuce', ykzRate: 1250, mlbRate: 1250, weight: 0.1 },
    cucumber: { id: 'cucumber', name: 'Cucumber', ykzRate: 938, mlbRate: 930, weight: 0.1 },
    fresh_mint: { id: 'fresh_mint', name: 'Fresh Mint', ykzRate: 625, mlbRate: 620, weight: 0.025 },
    lime: { id: 'lime', name: 'Lime', ykzRate: 1875, mlbRate: 1870, weight: 0.05 },
    banana: { id: 'banana', name: 'Banana', ykzRate: 1563, mlbRate: 1560, weight: 0.1 },
    strawberry: { id: 'strawberry', name: 'Strawberry', ykzRate: 1563, mlbRate: 1560, weight: 0.1 },
    avocado: { id: 'avocado', name: 'Avocado', ykzRate: 1563, mlbRate: 1560, weight: 0.1 },
    milk: { id: 'milk', name: 'Milk', ykzRate: 1563, mlbRate: 1560, weight: 0.2 },
    ramen_noodles: { id: 'ramen_noodles', name: 'Ramen Noodles', ykzRate: 2188, mlbRate: 2180, weight: 0.1 },
    sushi_rice: { id: 'sushi_rice', name: 'Sushi Rice', ykzRate: 2500, mlbRate: 2500, weight: 0.1 },
    nori_sheets: { id: 'nori_sheets', name: 'Nori Sheets', ykzRate: 1875, mlbRate: 1875, weight: 0.033 },
    eel_sauce: { id: 'eel_sauce', name: 'Eel Sauce', ykzRate: 2500, mlbRate: 2500, weight: 0.1 },
    tempura_batter: { id: 'tempura_batter', name: 'Tempura Batter', ykzRate: 1563, mlbRate: 1560, weight: 0.1 },
    sugar: { id: 'sugar', name: 'Sugar', ykzRate: 1250, mlbRate: 1250, weight: 0.1 },
    water: { id: 'water', name: 'Water', ykzRate: 625, mlbRate: 620, weight: 0.1 },
    carbonated_water: { id: 'carbonated_water', name: 'Carbonated Water', ykzRate: 1563, mlbRate: 1560, weight: 0.1 },
    tapioca_pearls: { id: 'tapioca_pearls', name: 'Tapioca Pearls', ykzRate: 2500, mlbRate: 2500, weight: 0.1 },
    matcha_powder: { id: 'matcha_powder', name: 'Matcha Powder', ykzRate: 2188, mlbRate: 2180, weight: 0.05 },
    fry_carton: { id: 'fry_carton', name: 'Fry Carton', ykzRate: 750, mlbRate: 750, weight: 0.005 }, // Estimated weight if not provided
    paper_cup: { id: 'paper_cup', name: 'Paper Cup', ykzRate: 937.5, mlbRate: 930, weight: 0.0125 },
    glass_cup: { id: 'glass_cup', name: 'Glass Cup', ykzRate: 1563, mlbRate: 1560, weight: 0.1 },
    bubble_tea_cup: { id: 'bubble_tea_cup', name: 'Bubble Tea Cup', ykzRate: 625, mlbRate: 620, weight: 0.025 },
    bowl: { id: 'bowl', name: 'Bowl', ykzRate: 1125, mlbRate: 1120, weight: 0.05 }, // Estimated
    bug_spray: { id: 'bug_spray', name: 'Bug Spray', ykzRate: 15625, mlbRate: 15620, weight: 0.2 },
    rat_poison: { id: 'rat_poison', name: 'Rat Poison', ykzRate: 15625, mlbRate: 15620, weight: 0.15 },
};

export const MENU_ITEMS: MenuItem[] = [
    {
        id: 'bbq_ribs',
        name: 'BBQ Ribs',
        category: 'Food',
        batchSize: 3,
        prepTime: '10s',
        finishedWeight: 1.1,
        ingredients: [
            { materialId: 'pork_rib', quantity: 9 },
            { materialId: 'bbq_sauce', quantity: 9 },
        ]
    },
    {
        id: 'ramen',
        name: 'Ramen',
        category: 'Food',
        batchSize: 15,
        prepTime: '30s',
        finishedWeight: 6.0,
        ingredients: [
            { materialId: 'pork_broth', quantity: 45 },
            { materialId: 'ramen_noodles', quantity: 45 },
            { materialId: 'egg', quantity: 45 },
            { materialId: 'chashu_pork', quantity: 45 },
        ]
    },
    {
        id: 'dragon_roll',
        name: 'Dragon Roll',
        category: 'Food',
        batchSize: 15,
        prepTime: '30s',
        finishedWeight: 3.8,
        ingredients: [
            { materialId: 'sushi_rice', quantity: 30 },
            { materialId: 'nori_sheets', quantity: 60 },
            { materialId: 'shrimp', quantity: 3 }, // Based on recipe: 3 Shrimp Tempura = 3 Shrimp + 3 Batter
            { materialId: 'tempura_batter', quantity: 3 },
            { materialId: 'avocado', quantity: 9 },
            { materialId: 'eel_sauce', quantity: 3 },
        ]
    },
    {
        id: 'garden_salad',
        name: 'Garden Salad',
        category: 'Food',
        batchSize: 9,
        prepTime: '15s',
        finishedWeight: 1.8,
        ingredients: [
            { materialId: 'lettuce', quantity: 18 },
            { materialId: 'tomato', quantity: 18 },
            { materialId: 'cucumber', quantity: 18 },
        ]
    },
    {
        id: 'matcha_milk_tea',
        name: 'Matcha Milk Tea',
        category: 'Beverage',
        batchSize: 15,
        prepTime: '50s',
        finishedWeight: 3.0,
        ingredients: [
            { materialId: 'matcha_powder', quantity: 60 },
            { materialId: 'milk', quantity: 60 },
            { materialId: 'tapioca_pearls', quantity: 60 },
            { materialId: 'bubble_tea_cup', quantity: 15 },
        ]
    },
    {
        id: 'virgin_mojito',
        name: 'Virgin Mojito',
        category: 'Beverage',
        batchSize: 15,
        prepTime: '10s',
        finishedWeight: 0.5,
        ingredients: [
            { materialId: 'lime', quantity: 45 },
            { materialId: 'fresh_mint', quantity: 45 },
            { materialId: 'sugar', quantity: 30 },
            { materialId: 'carbonated_water', quantity: 30 },
            { materialId: 'glass_cup', quantity: 15 },
        ]
    },
    {
        id: 'smoothie',
        name: 'Smoothie',
        category: 'Beverage',
        batchSize: 15,
        prepTime: '50s',
        finishedWeight: 3.0,
        ingredients: [
            { materialId: 'banana', quantity: 60 },
            { materialId: 'strawberry', quantity: 60 },
            { materialId: 'milk', quantity: 45 },
            { materialId: 'glass_cup', quantity: 15 },
        ]
    },
    {
        id: 'shrimp_tempura',
        name: 'Shrimp Tempura',
        category: 'Component',
        batchSize: 15,
        prepTime: '165s',
        finishedWeight: 2.7,
        ingredients: [
            { materialId: 'shrimp', quantity: 15 },
            { materialId: 'tempura_batter', quantity: 15 },
        ]
    }
];

export function calculateRequirements(selectedItems: { id: string; targetQuantity: number }[]) {
    const rawRequirements: Record<string, { materialId: string; quantity: number; weight: number; ykzCost: number; mlbCost: number }> = {};

    selectedItems.forEach(item => {
        const menuItem = MENU_ITEMS.find(m => m.id === item.id);
        if (!menuItem) return;

        const batches = Math.ceil(item.targetQuantity / menuItem.batchSize);

        menuItem.ingredients.forEach(ing => {
            const material = RAW_MATERIALS[ing.materialId];
            if (!material) return;

            const neededQty = ing.quantity * batches;
            const weight = material.weight * neededQty;
            const ykzCost = material.ykzRate * neededQty;
            const mlbCost = material.mlbRate * neededQty;

            if (rawRequirements[ing.materialId]) {
                rawRequirements[ing.materialId].quantity += neededQty;
                rawRequirements[ing.materialId].weight += weight;
                rawRequirements[ing.materialId].ykzCost += ykzCost;
                rawRequirements[ing.materialId].mlbCost += mlbCost;
            } else {
                rawRequirements[ing.materialId] = {
                    materialId: ing.materialId,
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
