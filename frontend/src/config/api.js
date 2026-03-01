const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://authentik-8p39.vercel.app";

export default API_BASE_URL;

export const getOrders = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 401) {
            // Clear auth tokens only, preserve other local state
            localStorage.removeItem('adminToken');
            localStorage.removeItem('token');
            localStorage.removeItem('adminRole');
            // Redirect to admin login
            window.location.href = '/admin';
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
            localStorage.removeItem('adminToken');
            localStorage.removeItem('token');
            localStorage.removeItem('adminRole');
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
    // action can be: 'authorize', 'process', 'dispatching', 'dispatch', 'received', 'reject'
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
            const error = await response.json();
            // For credit-related errors, re-throw with the full response data
            if (error.insufficientCredits) {
                const creditError = new Error(error.message || 'Insufficient credits');
                creditError.creditData = error;
                throw creditError;
            }
            throw new Error(error.message || `Failed to ${action} order`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Update Order (${action}) Error:`, error);
        throw error;
    }
};

export const getOrderById = async (orderId, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch order details');
        return await response.json();
    } catch (error) {
        console.error("Get Order Error:", error);
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

export const getStaffUsers = async (token, params = {}) => {
    try {
        // Build query string if params provided (e.g., brandId, role)
        const qs = new URLSearchParams();
        if (params.brandId) qs.append('brandId', params.brandId);
        if (params.role) qs.append('role', params.role);
        const url = `${API_BASE_URL}/admin/users/staff${qs.toString() ? `?${qs.toString()}` : ''}`;

        const response = await fetch(url, {
             headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('token');
            localStorage.removeItem('adminRole');
            window.location.href = '/admin';
            throw new Error('Session expired. Please login again.');
        }

        if(!response.ok) {
            const errText = await response.text();
            try {
                const errJson = JSON.parse(errText);
                throw new Error(errJson.message || 'Failed to fetch staff');
            } catch {
                throw new Error(errText || 'Failed to fetch staff');
            }
        }
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

export const getProfile = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 401) {
            localStorage.removeItem('token');
            // for user profile redirect to normal login
            window.location.href = '/login';
            throw new Error('Session expired.');
        }
        if (!response.ok) throw new Error('Failed to fetch profile');
        return await response.json();
    } catch (error) {
        console.error("Get Profile Error:", error);
        throw error;
    }
};

export const updateProfile = async (profileData, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(profileData)
        });
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            throw new Error('Session expired.');
        }
        if (!response.ok) throw new Error('Failed to update profile');
        return await response.json();
    } catch (error) {
         console.error("Update Profile Error:", error);
         throw error;
    }
};

export const createBrand = async (brandData, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/brands`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(brandData)
        });
        const contentType = response.headers.get('content-type') || '';
        if (!response.ok) {
            if (contentType.includes('application/json')) {
                const err = await response.json();
                throw new Error(err.message || 'Failed to create brand');
            } else {
                const txt = await response.text();
                throw new Error(txt || `Failed to create brand (status ${response.status})`);
            }
        }
        if (contentType.includes('application/json')) {
            return await response.json();
        }
        // unexpected content-type but OK; return text
        const txt = await response.text();
        return { message: txt };
    } catch(error) {
        console.error("Create Brand Error:", error);
        throw error;
    }
};

export const createCompany = async (companyData, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/companies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(companyData)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to create company');
        }
        return await response.json();
    } catch (error) {
        console.error('Create Company Error:', error);
        throw error;
    }
};

export const getBrands = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/brands`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        const contentType = response.headers.get('content-type') || '';
        if(!response.ok) {
            if (contentType.includes('application/json')) {
                const err = await response.json();
                throw new Error(err.message || 'Failed to fetch brands');
            } else {
                const txt = await response.text();
                throw new Error(txt || `Failed to fetch brands (status ${response.status})`);
            }
        }
        if (contentType.includes('application/json')) return await response.json();
        // Non-json successful response
        const txt = await response.text();
        throw new Error(txt || 'Failed to fetch brands');
    } catch(error) {
        console.error("Get Brands Error:", error);
        throw error;
    }
};

// New: getBrands with optional companyId
export const getBrandsForCompany = async (token, companyId) => {
    try {
        const qs = companyId ? `?companyId=${companyId}` : '';
        const response = await fetch(`${API_BASE_URL}/admin/brands${qs}`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        if(!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to fetch brands');
        }
        return await response.json();
    } catch(error) {
        console.error('Get Brands For Company Error:', error);
        throw error;
    }
};

export const getCompanies = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/companies`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to fetch companies');
        }
        return await response.json();
    } catch (error) {
        console.error('Get Companies Error:', error);
        throw error;
    }
};

// ─── Credit / Billing Helpers ───────────────────────────────────────

export const getCreditsBalance = async (token) => {
    const res = await fetch(`${API_BASE_URL}/admin/credits/balance`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch credit balance');
    return res.json();
};

export const checkOrderCredits = async (orderId, token) => {
    const res = await fetch(`${API_BASE_URL}/admin/credits/check/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to check credits');
    return res.json();
};

export const buyPlanCredits = async (planId, token) => {
    const res = await fetch(`${API_BASE_URL}/admin/credits/buy-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planId })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to buy plan');
    }
    return res.json();
};

export const buyTopupCredits = async (quantity, token) => {
    const res = await fetch(`${API_BASE_URL}/admin/credits/buy-topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to buy top-up credits');
    }
    return res.json();
};

export const getCreditTransactions = async (token, page = 1, limit = 20) => {
    const res = await fetch(`${API_BASE_URL}/admin/credits/transactions?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch credit transactions');
    return res.json();
};

export const getPlans = async () => {
    const res = await fetch(`${API_BASE_URL}/plans/plans`);
    if (!res.ok) throw new Error('Failed to fetch plans');
    return res.json();
};

// ─── Settings Helpers ───────────────────────────────────────

export const getSettings = async () => {
    const res = await fetch(`${API_BASE_URL}/plans/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
};

export const updateSettings = async (data, token) => {
    const res = await fetch(`${API_BASE_URL}/plans/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to update settings'); }
    return res.json();
};

// ─── Coupon Helpers ─────────────────────────────────────────

export const getCoupons = async (token) => {
    const res = await fetch(`${API_BASE_URL}/plans/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch coupons');
    return res.json();
};

export const createCoupon = async (data, token) => {
    const res = await fetch(`${API_BASE_URL}/plans/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to create coupon'); }
    return res.json();
};

export const updateCoupon = async (id, data, token) => {
    const res = await fetch(`${API_BASE_URL}/plans/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to update coupon'); }
    return res.json();
};

export const deleteCoupon = async (id, token) => {
    const res = await fetch(`${API_BASE_URL}/plans/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete coupon');
    return res.json();
};

export const validateCoupon = async (code, baseAmount, token) => {
    const res = await fetch(`${API_BASE_URL}/plans/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code, baseAmount }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Invalid coupon'); }
    return res.json();
};

// ─── Price Calculation & Payment Helpers ────────────────────

export const calculatePrice = async (baseAmount, couponCode, token) => {
    const res = await fetch(`${API_BASE_URL}/plans/calculate-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ baseAmount, couponCode }),
    });
    if (!res.ok) throw new Error('Failed to calculate price');
    return res.json();
};

export const initiatePayment = async (data, token) => {
    const res = await fetch(`${API_BASE_URL}/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to initiate payment'); }
    return res.json();
};

export const checkPaymentStatus = async (merchantOrderId, token) => {
    const res = await fetch(`${API_BASE_URL}/payments/status/${merchantOrderId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to check payment status');
    return res.json();
};

// ─── Dashboard Analytics APIs ───
const dashboardFetch = async (endpoint, token) => {
    const res = await fetch(`${API_BASE_URL}/dashboard/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin';
        throw new Error('Session expired');
    }
    if (!res.ok) throw new Error(`Dashboard ${endpoint} failed`);
    return res.json();
};

export const getDashboardStats = (token) => dashboardFetch('stats', token);
export const getScanTrend = (token, days = 30) => dashboardFetch(`scan-trend?days=${days}`, token);
export const getDuplicateTrend = (token, days = 30) => dashboardFetch(`duplicate-trend?days=${days}`, token);
export const getHighRiskSkus = (token, limit = 5) => dashboardFetch(`high-risk-skus?limit=${limit}`, token);
export const getBatchRisk = (token, limit = 10) => dashboardFetch(`batch-risk?limit=${limit}`, token);
export const getGeoData = (token) => dashboardFetch('geo-data', token);
export const getGeoMarkers = (token, limit = 200) => dashboardFetch(`geo-markers?limit=${limit}`, token);
export const getGeoAnomalies = (token) => dashboardFetch('geo-anomalies', token);
export const getRecentActivity = (token, limit = 10) => dashboardFetch(`recent-activity?limit=${limit}`, token);
export const getConsumerInsights = (token) => dashboardFetch('consumer-insights', token);
export const getProductPerformance = (token, days = 30) => dashboardFetch(`product-performance?days=${days}`, token);
