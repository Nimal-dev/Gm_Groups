'use server';

import { fetchBot } from '@/lib/bot-api';

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
        const response = await fetchBot(url, { method: 'GET', cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { success: true, items: data.items };
    } catch (error: any) {
        console.error('Get Inventory Error:', error);
        return { success: false, error: error.message, items: [] };
    }
}

export async function addVendorInventoryItem(payload: { itemName: string; price: number; unit: string; vendorRole: string }) {
    try {
        const response = await fetchBot('/api/vendor/inventory', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { success: true, item: data.item };
    } catch (error: any) {
        console.error('Add Inventory Error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateVendorInventoryItem(payload: { id: string; itemName?: string; price?: number; unit?: string }) {
    try {
        const response = await fetchBot('/api/vendor/inventory', {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return { success: true, item: data.item };
    } catch (error: any) {
        console.error('Update Inventory Error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteVendorInventoryItem(id: string) {
    try {
        const response = await fetchBot('/api/vendor/inventory', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
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
