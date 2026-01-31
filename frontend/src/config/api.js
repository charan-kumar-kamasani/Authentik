const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://authentik-8p39.vercel.app";

export default API_BASE_URL;

export const getOrders = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = '/admin'; // Redirect to login
            throw new Error('Session expired. Please login again.');
        }
        if (!response.ok) throw new Error('Failed to fetch orders');
        return await response.json();
    } catch (error) {
        console.error("Orders Error:", error);
        throw error;
    }
};

export const createOrder = async (orderData, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(orderData)
        });
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = '/admin';
            throw new Error('Session expired.');
        }
        if (!response.ok) throw new Error('Failed to create order');
        return await response.json();
    } catch (error) {
         console.error("Create Order Error:", error);
         throw error;
    }
};

export const updateOrderStatus = async (orderId, action, data, token) => {
    // action can be: 'authorize', 'accept', 'dispatch', 'activate', 'reject'
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/${action}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(data || {})
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to update order status');
        }
        return await response.json();
    } catch (error) {
        console.error("Update Order Status Error:", error);
        throw error;
    }
};

export const createStaffUser = async (userData, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/staff`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        if(!response.ok) {
             const err = await response.json();
             throw new Error(err.message || 'Failed to create user');
        }
        return await response.json();
    } catch(error) {
        console.error("Create Staff Error:", error);
        throw error;
    }
};

export const createCompanyUser = async (userData, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/company`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        if(!response.ok) {
             const err = await response.json();
             throw new Error(err.message || 'Failed to create company');
        }
        return await response.json();
    } catch(error) {
        console.error("Create Company Error:", error);
        throw error;
    }
};

export const getStaffUsers = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/staff`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        if(!response.ok) throw new Error('Failed to fetch staff');
        return await response.json();
    } catch(error) {
        console.error("Get Staff Error:", error);
        throw error;
    }
};

export const downloadOrderPdf = async (orderId, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/download`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        if(!response.ok) {
             const err = await response.json();
             throw new Error(err.message || 'Failed to download PDF');
        }
        return await response.json();
    } catch(error) {
        console.error("PDF Download Error:", error);
        throw error;
    }
};
