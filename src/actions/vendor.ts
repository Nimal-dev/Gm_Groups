'use server';

import { fetchBot } from '@/lib/bot-api';
import connectToDatabase from '@/lib/db';
import RawMaterial from '@/models/RawMaterial';
import VendorInventory from '@/models/VendorInventory';
import { revalidatePath } from 'next/cache';

// ==================== Admin Vendor Management ====================

export async function listVendorUsers() {
    try {
        const response = await fetchBot('/api/admin/vendors', { method: 'GET', cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { success: true, vendors: data.vendors };
    } catch (error: any) {
        console.error('List Vendors Error:', error);
        return { success: false, error: error.message, vendors: [] };
    }
}

export async function createVendorUser(payload: { name: string; vendorId: string; mpin: string; role: string }) {
    try {
        const response = await fetchBot('/api/admin/vendors', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { success: true, vendor: data.vendor };
    } catch (error: any) {
        console.error('Create Vendor Error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteVendorUser(id: string) {
    try {
        const response = await fetchBot('/api/admin/vendors', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { success: true };
    } catch (error: any) {
        console.error('Delete Vendor Error:', error);
        return { success: false, error: error.message };
    }
}

// ==================== Vendor Inventory ====================

export async function getVendorInventory(role?: string) {
    try {
        const url = role ? `/api/vendor/inventory?role=${role}` : '/api/vendor/inventory';
        let items: any[] = [];
        try {
            const response = await fetchBot(url, { method: 'GET', cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                if (data.items) items = data.items;
            }
        } catch (botErr) {
            console.warn('[VendorAction] fetchBot failed for getVendorInventory, falling back to direct DB:', botErr);
        }

        // Direct DB fallback if empty or bot offline
        if (items.length === 0) {
            await connectToDatabase();
            const query = role ? { vendorRole: role } : {};
            const dbItems = await VendorInventory.find(query).sort({ itemName: 1 }).lean();
            items = JSON.parse(JSON.stringify(dbItems));
        }

        return { success: true, items };
    } catch (error: any) {
        console.error('Get Inventory Error:', error);
        return { success: false, error: error.message, items: [] };
    }
}

export async function addVendorInventoryItem(payload: { itemName: string; price: number; unit: string; vendorRole: string }) {
    try {
        const cleanName = payload.itemName.trim();
        const numPrice = Number(payload.price);
        const itemUnit = payload.unit ? payload.unit.trim() : 'per unit';
        const role = payload.vendorRole;

        let botItem = null;
        try {
            const response = await fetchBot('/api/vendor/inventory', {
                method: 'POST',
                body: JSON.stringify({ itemName: cleanName, price: numPrice, unit: itemUnit, vendorRole: role }),
            });
            const data = await response.json();
            if (response.ok && data.item) botItem = data.item;
        } catch (botErr) {
            console.warn('[VendorAction] fetchBot failed for addVendorInventoryItem, using direct DB sync:', botErr);
        }

        // Direct DB Sync
        await connectToDatabase();
        let item = botItem;
        if (!item) {
            const created = await VendorInventory.create({
                itemName: cleanName,
                price: numPrice,
                unit: itemUnit,
                vendorRole: role
            });
            item = JSON.parse(JSON.stringify(created));
        }

        // Synchronize with RawMaterial model
        const slugId = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        const rateUpdate = role === 'YKZ' ? { ykzRate: numPrice } : { mlbRate: numPrice };

        await RawMaterial.findOneAndUpdate(
            { $or: [{ id: slugId }, { name: { $regex: new RegExp(`^${cleanName}$`, 'i') } }] },
            {
                $set: {
                    name: cleanName,
                    unit: itemUnit,
                    ...rateUpdate
                },
                $setOnInsert: {
                    id: slugId,
                    category: 'General',
                    weight: 0.1,
                    station: 'Kitchen',
                    ...(role === 'YKZ' ? { mlbRate: 0 } : { ykzRate: 0 })
                }
            },
            { upsert: true, new: true }
        );

        revalidatePath('/vendor-dashboard');
        revalidatePath('/rawrequest');
        revalidatePath('/portal/dashboard');
        revalidatePath('/dashboard');

        return { success: true, item };
    } catch (error: any) {
        console.error('Add Inventory Error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateVendorInventoryItem(payload: { id: string; itemName?: string; price?: number; unit?: string; vendorRole?: string }) {
    try {
        let botItem = null;
        try {
            const response = await fetchBot('/api/vendor/inventory', {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (response.ok && data.item) botItem = data.item;
        } catch (botErr) {
            console.warn('[VendorAction] fetchBot failed for updateVendorInventoryItem, using direct DB sync:', botErr);
        }

        // Direct DB Sync
        await connectToDatabase();
        const updateData: any = {};
        if (payload.itemName) updateData.itemName = payload.itemName.trim();
        if (payload.price != null) updateData.price = Number(payload.price);
        if (payload.unit) updateData.unit = payload.unit.trim();

        const item = await VendorInventory.findByIdAndUpdate(payload.id, updateData, { new: true });
        const targetItem = botItem || (item ? JSON.parse(JSON.stringify(item)) : null);

        if (targetItem) {
            const role = payload.vendorRole || targetItem.vendorRole;
            const updateFields: any = {};
            if (payload.price != null) {
                if (role === 'YKZ') updateFields.ykzRate = Number(payload.price);
                else updateFields.mlbRate = Number(payload.price);
            }
            if (payload.itemName) updateFields.name = payload.itemName.trim();
            if (payload.unit) updateFields.unit = payload.unit.trim();

            if (Object.keys(updateFields).length > 0) {
                const searchName = targetItem.itemName;
                await RawMaterial.updateOne(
                    { name: { $regex: new RegExp(`^${searchName}$`, 'i') } },
                    { $set: updateFields }
                );
            }
        }

        revalidatePath('/vendor-dashboard');
        revalidatePath('/rawrequest');
        revalidatePath('/portal/dashboard');
        revalidatePath('/dashboard');

        return { success: true, item: targetItem };
    } catch (error: any) {
        console.error('Update Inventory Error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteVendorInventoryItem(id: string) {
    try {
        try {
            await fetchBot('/api/vendor/inventory', {
                method: 'DELETE',
                body: JSON.stringify({ id }),
            });
        } catch (botErr) {
            console.warn('[VendorAction] fetchBot failed for deleteVendorInventoryItem, using direct DB sync:', botErr);
        }

        // Direct DB Sync
        await connectToDatabase();
        const item = await VendorInventory.findByIdAndDelete(id);

        if (item) {
            const role = item.vendorRole;
            const updateField = role === 'YKZ' ? { ykzRate: 0 } : { mlbRate: 0 };
            await RawMaterial.updateOne(
                { name: { $regex: new RegExp(`^${item.itemName.trim()}$`, 'i') } },
                { $set: updateField }
            );
        }

        revalidatePath('/vendor-dashboard');
        revalidatePath('/rawrequest');
        revalidatePath('/portal/dashboard');
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error: any) {
        console.error('Delete Inventory Error:', error);
        return { success: false, error: error.message };
    }
}

// ==================== Vendor Orders ====================

export async function getVendorOrders(role: string) {
    try {
        const response = await fetchBot(`/api/vendor/orders?role=${role}`, { method: 'GET', cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { success: true, orders: data.orders };
    } catch (error: any) {
        console.error('Get Orders Error:', error);
        return { success: false, error: error.message, orders: [] };
    }
}

export async function getEmployeeOrders(userId: string, username?: string, role?: string) {
    try {
        let url = `/api/vendor/orders?userId=${userId}`;
        if (username) url += `&username=${encodeURIComponent(username)}`;
        if (role) url += `&role=${role}`;
        
        const response = await fetchBot(url, { method: 'GET', cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { success: true, orders: data.orders || [] };
    } catch (error: any) {
        console.error('Get Employee Orders Error:', error);
        return { success: false, error: error.message, orders: [] };
    }
}

export async function createRawMaterialOrder(payload: {
    requestedBy: string;
    requestedByName: string;
    vendorRole: string;
    items: { itemName: string; quantity: number; price: number; unit: string }[];
    notes?: string;
}) {
    try {
        const response = await fetchBot('/api/vendor/orders', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { success: true, order: data.order };
    } catch (error: any) {
        console.error('Create Order Error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateOrderStatus(orderId: string, status: string) {
    try {
        const response = await fetchBot('/api/vendor/orders/status', {
            method: 'PUT',
            body: JSON.stringify({ orderId, status }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { success: true, order: data.order };
    } catch (error: any) {
        console.error('Update Order Status Error:', error);
        return { success: false, error: error.message };
    }
}

export async function cancelOrder(orderId: string, cancelReason: string, cancelledBy: string) {
    try {
        const response = await fetchBot('/api/vendor/orders/cancel', {
            method: 'PUT',
            body: JSON.stringify({ orderId, cancelReason, cancelledBy }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { success: true, order: data.order };
    } catch (error: any) {
        console.error('Cancel Order Error:', error);
        return { success: false, error: error.message };
    }
}

// ==================== Vendor Bills ====================

export async function createVendorBill(payload: {
    orderId: string;
    vendorRole: 'MLB' | 'YKZ';
    items: { itemName: string; quantity: number; price: number }[];
    totalPrice: number;
    bankAccount: string;
    sentBy: string;
}) {
    try {
        const response = await fetchBot('/api/vendor/bills', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { success: true, bill: data.bill };
    } catch (error: any) {
        console.error('Create Bill Error:', error);
        return { success: false, error: error.message };
    }
}

export async function getAdminBills(page: number = 1, limit: number = 10) {
    try {
        const response = await fetchBot(`/api/admin/bills?page=${page}&limit=${limit}`, { method: 'GET', cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { 
            success: true, 
            bills: data.bills,
            pagination: data.pagination || { page: 1, limit: 10, total: data.bills.length, totalPages: 1 }
        };
    } catch (error: any) {
        console.error('Get Admin Bills Error:', error);
        return { 
            success: false, 
            error: error.message, 
            bills: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
        };
    }
}

export async function updateBillStatus(billId: string, status: 'Unpaid' | 'Paid') {
    try {
        const response = await fetchBot('/api/admin/bills/status', {
            method: 'PUT',
            body: JSON.stringify({ billId, status }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { success: true, bill: data.bill };
    } catch (error: any) {
        console.error('Update Bill Status Error:', error);
        return { success: false, error: error.message };
    }
}

// ==================== Vendor Reports ====================

export async function getVendorReportData(role: string, startDate: string, endDate: string) {
    try {
        const response = await fetchBot(`/api/vendor/report?role=${role}&startDate=${startDate}&endDate=${endDate}`, {
            method: 'GET',
            cache: 'no-store'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { success: true, data: data.data };
    } catch (error: any) {
        console.error('Get Vendor Report Error:', error);
        return { success: false, error: error.message };
    }
}

export async function getVendorBills(role: string) {
    try {
        const response = await fetchBot(`/api/vendor/bills?role=${role}`, {
            method: 'GET',
            cache: 'no-store'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { success: true, bills: data.bills };
    } catch (error: any) {
        console.error('Get Vendor Bills Error:', error);
        return { success: false, error: error.message, bills: [] };
    }
}

export async function cancelVendorBill(orderId: string) {
    try {
        const response = await fetchBot('/api/vendor/bills/cancel', {
            method: 'POST',
            body: JSON.stringify({ orderId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { success: true };
    } catch (error: any) {
        console.error('Cancel Vendor Bill Error:', error);
        return { success: false, error: error.message };
    }
}
