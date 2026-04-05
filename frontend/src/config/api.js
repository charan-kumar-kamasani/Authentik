import loadingService from '../utils/loadingService';

let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://authentik-8p39.vercel.app";

// If the API URL is a local IP or localhost and we are on HTTPS, 
// but the backend is on HTTP, we use the /api proxy defined in vite.config.js
// to avoid Mixed Content warnings and connection issues.
if (typeof window !== 'undefined' && 
    (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && 
    API_BASE_URL.startsWith('http://') &&
    (API_BASE_URL.includes('192.168.') || API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1'))) {
    API_BASE_URL = '/api';
}


// Monkey-patch window.fetch to automatically increment/decrement the global
// loading counter and dedupe identical in-flight requests (url+method+body).
if (typeof window !== 'undefined' && window.fetch) {
    const _origFetch = window.fetch.bind(window);
    const inflight = new Map();

    const makeKey = (args) => {
        try {
            const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
            const opts = args[1] || {};
            const method = (opts.method || 'GET').toUpperCase();
            const body = opts.body || '';
            return `${method} ${url} ${typeof body === 'string' ? body : JSON.stringify(body)}`;
        } catch (e) {
            return Math.random().toString(36).slice(2);
        }
    };

    window.fetch = async (...args) => {
        const key = makeKey(args);
        if (inflight.has(key)) {
            const existing = inflight.get(key);
            return existing.then(res => res.clone());
        }
        loadingService.start();
        const p = (async () => {
            try {
                const res = await _origFetch(...args);
                return res;
            } finally {
                inflight.delete(key);
                loadingService.stop();
            }
        })();
        inflight.set(key, p);
        return p.then(res => res.clone());
    };
}

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
        if (!response.ok) {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || err.error || JSON.stringify(err) || 'Failed to create order');
            }
            const txt = await response.text().catch(() => 'Failed to create order');
            throw new Error(txt || 'Failed to create order');
        }
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

export const getBrandsForCompany = async (token, companyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/company-brands/${companyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch company brands');
    return await response.json();
  } catch (error) {
    console.error('Get Brands For Company Error:', error);
    throw error;
  }
};

export const getCompanyById = async (companyId, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/companies/${companyId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch company');
        return await response.json();
    } catch (error) {
        console.error('Get Company By Id Error:', error);
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



export const updateStaffUser = async (userId, userData, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/staff/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to update staff user');
        }
        return await response.json();
    } catch (error) {
        console.error('Update Staff User Error:', error);
        throw error;
    }
};

export const downloadOrderPdf = async (orderId, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/download`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        if(!response.ok) {
             console.error(`PDF Download Error Status: ${response.status} ${response.statusText}`);
             const err = await response.json().catch(() => ({ message: `Server returned ${response.status} ${response.statusText}` }));
             throw new Error(err.message || err.error || 'Failed to download PDF');
        }

        // Return blob instead of JSON
        return await response.blob();
    } catch(error) {
        console.error("PDF Download Error:", error);
        throw error;
    }
};

export const downloadOrderImages = async (orderId, token, format = 'png') => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/download-images?format=${format}`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        if(!response.ok) {
             const err = await response.json().catch(() => ({ message: `Server returned ${response.status}` }));
             throw new Error(err.message || 'Failed to download images');
        }
        return await response.blob();
    } catch(error) {
        console.error("Image Download Error:", error);
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

export const getBrands = async (companyId = null) => {
    try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const url = companyId ? `${API_BASE_URL}/admin/brands?companyId=${companyId}` : `${API_BASE_URL}/admin/brands`;
        const response = await fetch(url, {
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
        const txt = await response.text();
        throw new Error(txt || 'Failed to fetch brands');
    } catch(error) {
        console.error("Get Brands Error:", error);
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

export const getCreditTransactions = async (token, page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);
    if (filters.type) params.set('type', filters.type);
    if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.search) params.set('search', filters.search);

    const res = await fetch(`${API_BASE_URL}/admin/credits/transactions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch credit transactions');
    return res.json();
};

export const downloadInvoice = async (token, transactionId) => {
    const res = await fetch(`${API_BASE_URL}/admin/credits/transactions/${transactionId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to download invoice');
    
    // Get the blob and create download link
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${transactionId.slice(-8).toUpperCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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

export const getBillingConfig = async () => {
    const res = await fetch(`${API_BASE_URL}/plans/billing-config`);
    if (!res.ok) throw new Error('Failed to fetch billing config');
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

    console.log('Initiate Payment Response:', res);
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
export const getSkuIntelligence = (token) => dashboardFetch('sku-intelligence', token);

export const exportDashboardData = async (token, months = 3) => {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/export?months=${months}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: `Export failed (${response.status})` }));
            throw new Error(err.message || 'Export error');
        }
        return await response.blob();
    } catch (error) {
        console.error("Dashboard Export Error:", error);
        throw error;
    }
};

// ─── Test Accounts APIs ───
export const getTestAccounts = async () => {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${API_BASE_URL}/admin/test-accounts`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin';
        throw new Error('Session expired');
    }
    if (!res.ok) throw new Error('Failed to fetch test accounts');
    return res.json();
};

export const createTestAccount = async (data) => {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${API_BASE_URL}/admin/test-accounts`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data),
    });
    if (res.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin';
        throw new Error('Session expired');
    }
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create test account');
    }
    return res.json();
};

export const updateTestAccount = async (id, data) => {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${API_BASE_URL}/admin/test-accounts/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data),
    });
    if (res.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin';
        throw new Error('Session expired');
    }
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update test account');
    }
    return res.json();
};

export const deleteTestAccount = async (id) => {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${API_BASE_URL}/admin/test-accounts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin';
        throw new Error('Session expired');
    }
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete test account');
    }
    return res.json();
};

export const checkIsTestAccount = async () => {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${API_BASE_URL}/admin/test-accounts/check`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to check test account status');
    return res.json();
};

// Alias for convenience
export const getAllCompanies = getCompanies;

export const updateBrand = async (brandId, data, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/brands/${brandId}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update brand');
        return await response.json();
    } catch (error) {
        console.error("Update Brand Error:", error);
        throw error;
    }
};

export const updateCompany = async (companyId, data, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/companies/${companyId}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to update company');
        }
        return await response.json();
    } catch (error) {
        console.error("Update Company Error:", error);
        throw error;
    }
};

export const getProductTemplates = async (params = {}) => {
    try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const query = typeof params === 'object' ? new URLSearchParams(params).toString() : `companyId=${params}`;
        const response = await fetch(`${API_BASE_URL}/product-templates?${query}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch product templates');
        return await response.json();
    } catch (error) {
        console.error("Get Product Templates Error:", error);
        throw error;
    }
};

export const getProductTemplatesByCompany = (companyId) => getProductTemplates({ companyId });

export const createProductTemplate = async (data) => {
    try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/product-templates`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create product template');
        return await response.json();
    } catch (error) {
        console.error("Create Product Template Error:", error);
        throw error;
    }
};

export const deleteProductTemplate = async (templateId) => {
    try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/product-templates/${templateId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete product template');
        return await response.json();
    } catch (error) {
        console.error("Delete Product Template Error:", error);
        throw error;
    }
};

export const rejectOrder = async (orderId, reason) => {
  try {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || 'Failed to reject order');
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
};

export const updateOrder = async (orderId, updates) => {
  try {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || 'Failed to edit order');
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
};

export const updateProductTemplate = async (templateId, data) => {
  try {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/product-templates/${templateId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || 'Failed to update template');
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
};

export const authorizeProductTemplate = async (templateId) => {
    try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/product-templates/${templateId}/authorize`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to authorize product template');
        return await response.json();
    } catch (error) {
        console.error("Authorize Product Template Error:", error);
        throw error;
    }
};

export const submitReview = async (reviewData, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(reviewData)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Failed to submit review');
        }
        return await response.json();
    } catch (error) {
        console.error("Submit Review Error:", error);
        throw error;
    }
};

export const getProductReviews = async (productId, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch product reviews');
        return await response.json();
    } catch (error) {
        console.error("Get Product Reviews Error:", error);
        throw error;
    }
};

export const getAllReviews = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews/all`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch all reviews');
        return await response.json();
    } catch (error) {
        console.error("Get All Reviews Error:", error);
        throw error;
    }
};

export const getMyRewards = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews/my-rewards`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch rewards');
        return await response.json();
    } catch (error) {
        console.error("Get My Rewards Error:", error);
        throw error;
    }
};

export const getRewardDetail = async (id, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews/my-rewards/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch reward detail');
        return await response.json();
    } catch (error) {
        console.error("Get Reward Detail Error:", error);
        throw error;
    }
};

export const getProductCoupons = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/product-coupons`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch product coupons');
        return await response.json();
    } catch (error) {
        console.error("Get Product Coupons Error:", error);
        throw error;
    }
};

export const getClaimedRewards = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/claimed-rewards`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch claimed rewards');
        return await response.json();
    } catch (error) {
        console.error("Get Claimed Rewards Error:", error);
        throw error;
    }
};
// ==========================================
// 12. LEADS API
// ==========================================

export const getLeads = async (page = 1, limit = 50, status = '', token) => {
    try {
        const query = new URLSearchParams({ page, limit });
        if (status) query.append('status', status);
        const res = await fetch(`${API_BASE_URL}/leads?${query.toString()}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch leads');
        return await res.json();
    } catch (e) {
        throw e;
    }
};

export const updateLeadStatus = async (id, status, notes, token) => {
    try {
        const body = {};
        if (status) body.status = status;
        if (notes !== undefined) body.notes = notes;
        
        const res = await fetch(`${API_BASE_URL}/leads/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('Failed to update lead');
        return await res.json();
    } catch (e) {
        throw e;
    }
};
