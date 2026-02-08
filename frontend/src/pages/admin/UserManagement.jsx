import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  createCompanyUser,
  createStaffUser,
  getStaffUsers,
  createBrand,
  getBrands,
  createCompany,
  getCompanies,
  getBrandsForCompany,
} from "../../config/api";
import { useNavigate, useLocation } from "react-router-dom";
import { debounce } from "../../utils/helper";

const UserManagement = () => {
  const navigate = useNavigate();
  // Initialize role from localStorage to avoid setting state synchronously inside useEffect
  const [role, _setRole] = useState(() => {
    const adminRole = localStorage.getItem("adminRole");
    if (adminRole) return adminRole;
    const userStr = localStorage.getItem("userInfo");
    if (userStr) {
      try {
        return JSON.parse(userStr).role || "";
      } catch {
        return "";
      }
    }
    return "";
  });
  const [staff, setStaff] = useState([]);
  const [brandFilter, setBrandFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [activeTab, setActiveTab] = useState("list"); // 'list', 'create', 'createBrand', 'createStaff'
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [, setLoadingBrands] = useState(false);
  const [query, setQuery] = useState("");
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userRole: "creator",
    brandId: "",
  });
  // Brand State
  const [brands, setBrands] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    legalEntity: "",
    companyWebsite: "",
    industry: "",
    country: "",
    city: "",
    cinGst: "",
    registerOfficeAddress: "",
    dispatchAddress: "",
    email: "",
    phoneNumber: "",
    contactPersonName: "",
  });
  const [companyBrands, setCompanyBrands] = useState([
    { brandName: "", brandLogo: "" },
  ]);
  const [brandForm, setBrandForm] = useState({
    brandName: "",
    legalEntity: "",
    brandLogo: "",
    brandWebsite: "",
    industry: "",
    country: "",
    city: "",
    cinGst: "",
    registerOfficeAddress: "",
    dispatchAddress: "",
    email: "",
    phoneNumber: "",
    contactPersonName: "",
  });

  const loadStaff = useCallback(
    async (opts = {}) => {
      setLoadingStaff(true);
      try {
        const token =
          localStorage.getItem("adminToken") || localStorage.getItem("token");
        // Merge current filters with any overrides passed
        const params = {
          brandId: opts.brandId !== undefined ? opts.brandId : brandFilter,
          role: opts.level !== undefined ? opts.level : levelFilter,
        };
        const companyId = opts.companyId !== undefined ? opts.companyId : companyFilter;
        // Remove empty values
        Object.keys(params).forEach((k) => {
          if (!params[k]) delete params[k];
        });

        const data = await getStaffUsers(token, params);
        let staffData = data || [];
        // If company filter is set, narrow staff to those belonging to the company
        if (companyId) {
          try {
            // Fetch brands for the company and filter staff by companyId or brandId belonging to company
            const companyBrands = await getBrandsForCompany(token, companyId);
            const brandIds = (companyBrands || []).map((b) => String(b._id));
            staffData = (staffData || []).filter((u) => {
              // if user has companyId field set, compare; otherwise check brandId
              if (!u) return false;
              try {
                if (u.companyId && String(u.companyId) === String(companyId)) return true;
              } catch (e) {}
              if (u.brandId && brandIds.includes(String(u.brandId))) return true;
              return false;
            });
          } catch (e) {
            console.warn('Failed to filter staff by company', e);
          }
        }
        setStaff(staffData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStaff(false);
      }
    },
    [brandFilter, levelFilter, companyFilter],
  );

  // Debounced loader to avoid hammering the API when changing filters quickly
  const debouncedLoadStaff = useMemo(
    () => debounce((p) => loadStaff(p), 300),
    [loadStaff],
  );

  const searchInputRef = useRef(null);

  const clearFilters = () => {
    setBrandFilter("");
    setLevelFilter("");
    setCompanyFilter("");
    // load all staff
    loadStaff();
  };

  const loadBrands = async () => {
    setLoadingBrands(true);
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const data = await getBrands(token);
      setBrands(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBrands(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const data = await getCompanies(token);
      setCompanies(data || []);
    } catch (e) {
      console.error("Load Companies Error:", e);
    }
  };

  const loadBrandsForCompany = async (companyId) => {
    setLoadingBrands(true);
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const data = await getBrandsForCompany(token, companyId);
      setBrands(data || []);
    } catch (e) {
      console.error("Load Brands For Company Error:", e);
    } finally {
      setLoadingBrands(false);
    }
  };

  // Load brands and staff once based on already-initialized `role`.
  useEffect(() => {
    if (!role) return;
    // Admins and superadmins should be able to see companies/staff
    if (["admin", "superadmin", "company"].includes(role)) {
      loadBrands();
      // Load companies for superadmin/admin
      if (["admin", "superadmin"].includes(role)) loadCompanies();
    }
    if (["company", "authorizer", "admin", "superadmin"].includes(role)) {
      loadStaff();
    }
  }, [role]);

  // Ensure companies are loaded when switching to createBrand or createStaff tabs
  useEffect(() => {
    if (!role) return;
    if (["createBrand", "createStaff"].includes(activeTab) && ["admin", "superadmin"].includes(role)) {
      loadCompanies();
    }
  }, [activeTab, role]);

  // Defensive: if companies empty when opening create tabs, attempt to reload once
  useEffect(() => {
    if (!role) return;
    if (["createBrand", "createStaff"].includes(activeTab) && ["admin", "superadmin"].includes(role) && companies.length === 0) {
      // try to load companies again (handles timing issues where token/role may be set later)
      loadCompanies();
    }
  }, [activeTab, role, companies.length]);

  // helper to map brandId to name
  const getBrandName = (id) => {
    if (!id) return "-";
    const b = brands.find((x) => String(x._id) === String(id));
    return b ? b.brandName || "-" : "-";
  };

  // helper to map companyId to name
  const getCompanyName = (id) => {
    if (!id) return "-";
    // if populated object
    if (typeof id === "object" && id.companyName) return id.companyName;
    const c = companies.find((x) => String(x._id) === String(id));
    return c ? c.companyName || "-" : "-";
  };

  // Read `tab` query param to initialize activeTab when landing from sidebar submenu
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const adminToken = localStorage.getItem("adminToken");
    const token = adminToken || localStorage.getItem("token");
    try {
      if (activeTab === "create" && role === "admin") {
        // Admin creates company
        await createCompanyUser(formData, token);
        alert("Company Created Successfully");
      } else {
        // Create staff (for createStaff tab or for other roles in create tab)
        // include companyId when available (selectedCompany or resolved from brand)
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.userRole,
          brandId: formData.brandId,
        };
        if (selectedCompany) payload.companyId = selectedCompany;
        await createStaffUser(payload, token);
        alert("User Created Successfully");
        loadStaff();
      }
      setFormData({
        name: "",
        email: "",
        password: "",
        userRole: "creator",
        brandId: "",
      });
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("token");
    try {
      // If admin/superadmin used the multi-row brand inputs (companyBrands), create each brand for selectedCompany
      const rows = companyBrands.filter((b) => b.brandName && b.brandName.trim() !== "");
      if (rows.length > 0) {
        if (!selectedCompany) {
          alert("Please select a company to associate these brands with.");
          return;
        }
        // create all brands sequentially to avoid race conditions on backend
        const created = [];
        for (const r of rows) {
          const payload = {
            brandName: r.brandName,
            brandLogo: r.brandLogo || null,
            companyId: selectedCompany,
          };
          const res = await createBrand(payload, token);
          created.push(res);
        }
        alert(`Created ${created.length} brand(s) successfully`);
        // reset brand rows
        setCompanyBrands([{ brandName: "", brandLogo: "" }]);
        // reload brands for the selected company
        loadBrandsForCompany(selectedCompany);
      } else {
        // fallback: single brand form
        await createBrand(brandForm, token);
        alert("Brand Created Successfully");
        setBrandForm({
          brandName: "",
          legalEntity: "",
          brandLogo: "",
          brandWebsite: "",
          industry: "",
          country: "",
          city: "",
          cinGst: "",
          registerOfficeAddress: "",
          dispatchAddress: "",
          email: "",
          phoneNumber: "",
          contactPersonName: "",
        });
        loadBrands();
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    try {
      // Build payload
      const payload = {
        ...companyForm,
        brands: companyBrands.filter((b) => b.brandName && b.brandName.trim() !== ""),
      };
      if (payload.brands.length === 0) {
        // allow company creation without brands but warn
        if (!confirm('No brands added. Continue creating company without brands?')) return;
      }
      const res = await createCompany(payload, token);
      alert('Company created successfully');
      // reset form
      setCompanyForm({
        companyName: "",
        legalEntity: "",
        companyWebsite: "",
        industry: "",
        country: "",
        city: "",
        cinGst: "",
        registerOfficeAddress: "",
        dispatchAddress: "",
        email: "",
        phoneNumber: "",
        contactPersonName: "",
      });
      setCompanyBrands([{ brandName: "", brandLogo: "" }]);
      // reload companies and brands
      loadCompanies();
      if (res && res.company && res.company._id) loadBrandsForCompany(res.company._id);
    } catch (err) {
      alert('Error creating company: ' + (err.message || err));
    }
  };

  const addCompanyBrandRow = () => {
    setCompanyBrands((s) => [...s, { brandName: "", brandLogo: "" }]);
  };

  const updateCompanyBrandRow = (index, key, value) => {
    setCompanyBrands((s) => s.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  };

  const removeCompanyBrandRow = (index) => {
    setCompanyBrands((s) => s.filter((_, i) => i !== index));
  };

  if (role === "user" || role === "creator")
    return <div className="p-10">Access Denied</div>;

  const getRoleClass = (r) => {
    switch ((r || "").toLowerCase()) {
      case "superadmin":
        return "bg-purple-600 text-white";
      case "admin":
        return "bg-blue-600 text-white";
      case "company":
        return "bg-green-600 text-white";
      case "authorizer":
        return "bg-amber-500 text-white";
      case "creator":
        return "bg-gray-400 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Render the create panel depending on role
  const renderCreateSection = () => {
    if (role === 'superadmin') {
      return (
        <div className="bg-white rounded-2xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
            Create Company
          </h2>
          <form onSubmit={handleCompanySubmit} className="grid grid-cols-1 gap-4">
            <InputGroup label="Company Name" placeholder="Acme Holdings" value={companyForm.companyName} onChange={(v)=>setCompanyForm({...companyForm, companyName: v})} />
            <InputGroup label="Legal Entity" placeholder="Pvt Ltd" value={companyForm.legalEntity} onChange={(v)=>setCompanyForm({...companyForm, legalEntity: v})} />
            <InputGroup label="Website" placeholder="https://..." value={companyForm.companyWebsite} onChange={(v)=>setCompanyForm({...companyForm, companyWebsite: v})} />
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Industry" placeholder="FMCG" value={companyForm.industry} onChange={(v)=>setCompanyForm({...companyForm, industry: v})} />
              <InputGroup label="Country" placeholder="India" value={companyForm.country} onChange={(v)=>setCompanyForm({...companyForm, country: v})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="City" placeholder="Bengaluru" value={companyForm.city} onChange={(v)=>setCompanyForm({...companyForm, city: v})} />
              <InputGroup label="CIN / GST" placeholder="CIN/GST" value={companyForm.cinGst} onChange={(v)=>setCompanyForm({...companyForm, cinGst: v})} />
            </div>
            <InputGroup label="Register Office Address" placeholder="Address" value={companyForm.registerOfficeAddress} onChange={(v)=>setCompanyForm({...companyForm, registerOfficeAddress: v})} />
            <InputGroup label="Dispatch Address" placeholder="Address" value={companyForm.dispatchAddress} onChange={(v)=>setCompanyForm({...companyForm, dispatchAddress: v})} />
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Email" type="email" placeholder="contact@company.com" value={companyForm.email} onChange={(v)=>setCompanyForm({...companyForm, email: v})} />
              <InputGroup label="Phone" placeholder="+91..." value={companyForm.phoneNumber} onChange={(v)=>setCompanyForm({...companyForm, phoneNumber: v})} />
            </div>
            <InputGroup label="Contact Person" placeholder="Name" value={companyForm.contactPersonName} onChange={(v)=>setCompanyForm({...companyForm, contactPersonName: v})} />
            <div className="mt-2">
              <h4 className="font-medium mb-2">Brands (optional)</h4>
              {companyBrands.map((b, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-start gap-4 mb-3 p-3 border border-gray-100 rounded-lg bg-white shadow-sm"
                >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InputGroup
                        label="Brand Name"
                        placeholder="Brand name"
                        value={b.brandName}
                        onChange={(v) => updateCompanyBrandRow(idx, 'brandName', v)}
                        required={false}
                      />

                      <div>
                        <InputGroup
                          label="Brand Logo (URL)"
                          placeholder="https://..."
                          value={b.brandLogo}
                          onChange={(v) => updateCompanyBrandRow(idx, 'brandLogo', v)}
                          type="url"
                          required={false}
                        />
                        {b.brandLogo && (
                          <div className="mt-2 flex items-center gap-3">
                            <img
                              src={b.brandLogo}
                              alt="brand logo"
                              className="w-16 h-12 object-contain border rounded-md shadow-sm"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <span className="text-xs text-gray-500">Preview</span>
                          </div>
                        )}
                      </div>
                    </div>

                  <div className="flex flex-col items-end justify-between gap-2 w-auto">
                    <button
                      type="button"
                      onClick={() => removeCompanyBrandRow(idx)}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded border text-sm flex items-center justify-center"
                      aria-label="Remove brand"
                      title="Remove brand"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                      </svg>
                    </button>
                    {idx === companyBrands.length - 1 && (
                      <button
                        type="button"
                        onClick={addCompanyBrandRow}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center justify-center"
                        aria-label="Add brand"
                        title="Add brand"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <button className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200">Create Company</button>
            </div>
          </form>
        </div>
      );
    }

    // default: create staff/user form for admin/company roles
    return (
      <div className="bg-white rounded-2xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 max-w-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
          Create Staff
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <InputGroup label="Name" placeholder="Full name" value={formData.name} onChange={(v)=>setFormData({...formData, name: v})} />
          <InputGroup label="Email" type="email" placeholder="user@company.com" value={formData.email} onChange={(v)=>setFormData({...formData, email: v})} />
          <InputGroup label="Password" type="password" placeholder="••••••••" value={formData.password} onChange={(v)=>setFormData({...formData, password: v})} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" value={formData.userRole} onChange={(e)=>setFormData({...formData, userRole: e.target.value})} required>
              {role === 'company' && <option value="authorizer">Authorizer</option>}
              {role === 'authorizer' && <option value="creator">Creator</option>}
              {(role === 'admin' || role === 'superadmin') && (<>
                <option value="authorizer">Authorizer</option>
                <option value="creator">Creator</option>
              </>) }
            </select>
          </div>

          {/* If admin/superadmin creating staff: show company selector then brand selector */}
          {(role === 'admin' || role === 'superadmin') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <div className="flex gap-2 items-center">
                <select
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  value={selectedCompany}
                  onChange={(e) => {
                    const cid = e.target.value;
                    setSelectedCompany(cid);
                    loadBrandsForCompany(cid);
                    setFormData({ ...formData, brandId: "" });
                  }}
                >
                  <option value="">{companies.length === 0 ? 'No companies found' : 'Select Company'}</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => loadCompanies()}
                  className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-700"
                >
                  Reload
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" value={formData.brandId} onChange={(e)=>setFormData({...formData, brandId: e.target.value})} required>
              <option value="">Select Brand</option>
              {brands.map((brand)=>(<option key={brand._id} value={brand._id}>{brand.brandName}</option>))}
            </select>
          </div>

          <div>
            <button className="w-full bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-all shadow-lg">Create User</button>
          </div>
        </form>
      </div>
    );
  };

  // Add Nav
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 ">
        <div className="flex gap-6 mb-6">
          <main className="flex-1">
            <div className="space-y-6">
              {/* header like AdminDashboard */}
              <header className="mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                    User Management
                  </h2>
                  <p className="text-gray-500 mt-2">
                    Create and manage users, brands and staff access.
                  </p>
                </div>
              </header>
              {/* small search + submenu row (improved UI) */}
              {activeTab === "list" && (
                <div className="bg-white p-3 rounded-lg shadow-sm border flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex items-center gap-3 w-full md:w-auto flex-1 min-w-0">
                    <div className="relative flex-1 min-w-0">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-4.35-4.35"
                          />
                          <circle
                            cx="11"
                            cy="11"
                            r="6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          />
                        </svg>
                      </span>
                      <input
                        ref={searchInputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search users by name or email..."
                        className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 text-sm placeholder-gray-400"
                      />
                      {query && (
                        <button
                          onClick={() => {
                            setQuery("");
                            searchInputRef.current?.focus();
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          aria-label="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <select
                          value={brandFilter}
                          onChange={(e) => {
                            setBrandFilter(e.target.value);
                            debouncedLoadStaff({ brandId: e.target.value });
                          }}
                          className="appearance-none bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm pr-8"
                        >
                          <option value="">All Brands</option>
                          {brands.map((b) => (
                            <option key={b._id} value={b._id}>
                              {b.brandName}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                          ▾
                        </span>
                      </div>

                      <div className="relative">
                        <select
                          value={companyFilter}
                          onChange={(e) => {
                            setCompanyFilter(e.target.value);
                            // When company filter changes, load staff filtered by company
                            debouncedLoadStaff({ companyId: e.target.value });
                          }}
                          className="appearance-none bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm pr-8"
                        >
                          <option value="">All Companies</option>
                          {companies.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.companyName}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                          ▾
                        </span>
                      </div>

                      <div className="relative">
                        <select
                          value={levelFilter}
                          onChange={(e) => {
                            setLevelFilter(e.target.value);
                            debouncedLoadStaff({ level: e.target.value });
                          }}
                          className="appearance-none bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm pr-8"
                        >
                          <option value="">All Levels</option>
                          <option value="authorizer">Authorizer</option>
                          <option value="creator">Creator</option>
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                          ▾
                        </span>
                      </div>
                    </div>
                  </div>

                    <div className="flex items-center gap-3 justify-end">
                    {(brandFilter || levelFilter || companyFilter) && (
                      <div className="hidden md:flex items-center gap-2">
                        {brandFilter && (
                          <button
                            onClick={() => {
                              setBrandFilter("");
                              loadStaff();
                            }}
                            className="text-sm bg-gray-100 px-2 py-1 rounded"
                          >
                            Brand: {getBrandName(brandFilter)} ✕
                          </button>
                        )}
                        {levelFilter && (
                          <button
                            onClick={() => {
                              setLevelFilter("");
                              loadStaff();
                            }}
                            className="text-sm bg-gray-100 px-2 py-1 rounded"
                          >
                            Level: {levelFilter} ✕
                          </button>
                        )}
                        {companyFilter && (
                          <button
                            onClick={() => {
                              setCompanyFilter("");
                              loadStaff();
                            }}
                            className="text-sm bg-gray-100 px-2 py-1 rounded"
                          >
                            Company: {companies.find(x => String(x._id) === String(companyFilter))?.companyName || '-'} ✕
                          </button>
                        )}
                        <button
                          onClick={clearFilters}
                          className="text-sm text-gray-500 underline"
                        >
                          Clear
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        (navigate("/users?tab=createStaff"),
                          setActiveTab("createStaff"));
                      }}
                      className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow"
                    >
                      + Create User
                    </button>
                  </div>
                </div>
              )}

              {(role === "admin" || role === "superadmin") && activeTab === "createBrand" && (
                role === 'superadmin' ? (
                  // For superadmin, show the full Create Company form (allows adding multiple brands)
                  renderCreateSection()
                ) : (
                  // For admin, keep the single-brand create form
                  <div className="bg-white rounded-2xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 max-w-3xl">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                      Create Brand
                    </h2>
                    <form
                      onSubmit={handleBrandSubmit}
                      className="grid grid-cols-2 gap-6"
                    >
                        {/* Admin brand creation: show company selector then brand details in a compact grid */}
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                          <select
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                            value={selectedCompany}
                            onChange={(e) => {
                              const cid = e.target.value;
                              setSelectedCompany(cid);
                              // load brands for this company so other brand selectors update
                              if (cid) loadBrandsForCompany(cid);
                              // link company to brandForm for single-brand creation
                              setBrandForm({ ...brandForm, companyId: cid });
                            }}
                          >
                            <option value="">Select Company</option>
                            {companies.map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.companyName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <InputGroup
                          label="Brand Name"
                          placeholder="Acme Corp"
                          value={brandForm.brandName}
                          onChange={(v) => setBrandForm({ ...brandForm, brandName: v })}
                        />

                        <InputGroup
                          label="Brand Logo (URL)"
                          placeholder="https://..."
                          value={brandForm.brandLogo}
                          onChange={(v) => setBrandForm({ ...brandForm, brandLogo: v })}
                        />

                      <div className="col-span-2">
                        <h4 className="font-medium mb-2">Brands (optional)</h4>
                        {companyBrands.map((b, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row sm:items-start gap-4 mb-3 p-3 border border-gray-100 rounded-lg bg-white shadow-sm"
                          >
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 ml-1">Brand Name</label>
                                <input
                                  value={b.brandName}
                                  onChange={(e) => updateCompanyBrandRow(idx, 'brandName', e.target.value)}
                                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all font-medium"
                                  placeholder="Brand name"
                                  aria-label={`Brand name ${idx + 1}`}
                                />
                              </div>

                              <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 ml-1">Brand Logo (URL)</label>
                                <input
                                  value={b.brandLogo}
                                  onChange={(e) => updateCompanyBrandRow(idx, 'brandLogo', e.target.value)}
                                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all font-medium"
                                  placeholder="https://..."
                                  aria-label={`Brand logo URL ${idx + 1}`}
                                  type="url"
                                />
                                {b.brandLogo && (
                                  <div className="mt-2 flex items-center gap-3">
                                    <img
                                      src={b.brandLogo}
                                      alt="brand logo"
                                      className="w-14 h-10 object-contain border rounded"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                    <span className="text-xs text-gray-500">Preview</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end justify-between gap-2 w-auto">
                              <button
                                type="button"
                                onClick={() => removeCompanyBrandRow(idx)}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-red-700 text-sm hover:bg-gray-50 flex items-center justify-center"
                                aria-label="Remove brand"
                                title="Remove brand"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                                </svg>
                              </button>
                              {idx === companyBrands.length - 1 && (
                                <button
                                  type="button"
                                  onClick={addCompanyBrandRow}
                                  className="px-3 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-medium flex items-center justify-center"
                                  aria-label="Add brand"
                                  title="Add brand"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="col-span-2">
                        <button className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200">
                          Create Brand(s)
                        </button>
                      </div>
                    </form>
                  </div>
                )
              )}

                    {activeTab === 'create' && renderCreateSection()}

              {activeTab === "createStaff" && (
                <div className="bg-white rounded-2xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 ">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Create Staff
                  </h2>
                  <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-4"
                  >
                    <InputGroup
                      label="Name"
                      placeholder="Full name"
                      value={formData.name}
                      onChange={(v) => setFormData({ ...formData, name: v })}
                    />
                    <InputGroup
                      label="Email"
                      type="email"
                      placeholder="user@company.com"
                      value={formData.email}
                      onChange={(v) => setFormData({ ...formData, email: v })}
                    />
                    <InputGroup
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(v) =>
                        setFormData({ ...formData, password: v })
                      }
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Level
                      </label>
                      <select
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                        value={formData.userRole}
                        onChange={(e) =>
                          setFormData({ ...formData, userRole: e.target.value })
                        }
                        required
                      >
                        {role === "company" && (
                          <option value="authorizer">Authorizer</option>
                        )}
                        {role === "authorizer" && (
                          <option value="creator">Creator</option>
                        )}
                        {(role === "admin" || role === "superadmin") && (
                          <>
                            <option value="authorizer">Authorizer</option>
                            <option value="creator">Creator</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* If admin/superadmin creating staff: show company selector above brand */}
                    {(role === 'admin' || role === 'superadmin') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                        <div className="flex gap-2 items-center">
                          <select
                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                            value={selectedCompany}
                            onChange={(e) => {
                              const cid = e.target.value;
                              setSelectedCompany(cid);
                              loadBrandsForCompany(cid);
                              setFormData({ ...formData, brandId: "" });
                            }}
                          >
                            <option value="">{companies.length === 0 ? 'No companies found' : 'Select Company'}</option>
                            {companies.map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.companyName}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => loadCompanies()}
                            className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-700"
                          >
                            Reload
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                      </label>
                      <select
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                        value={formData.brandId}
                        onChange={(e) =>
                          setFormData({ ...formData, brandId: e.target.value })
                        }
                        required
                      >
                        <option value="">Select Brand</option>
                        {brands.map((brand) => (
                          <option key={brand._id} value={brand._id}>
                            {brand.brandName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <button className="w-full bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-all shadow-lg">
                        Create User
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "list" && (
                <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">User List</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                      {staff.length} users
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                          <th className="px-8 py-4">Name</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Company</th>
                          <th className="px-6 py-4">Brand</th>
                          <th className="px-6 py-4">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(() => {
                          const q = query.trim().toLowerCase();
                          const displayed = q
                            ? staff.filter(
                                (u) =>
                                  (u.name || "").toLowerCase().includes(q) ||
                                  (u.email || "").toLowerCase().includes(q),
                              )
                            : staff;
                          if (loadingStaff) {
                            return (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="px-8 py-12 text-center text-gray-400"
                                >
                                  Loading users...
                                </td>
                              </tr>
                            );
                          }
                          if (displayed.length === 0) {
                            return (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="px-8 py-12 text-center text-gray-400"
                                >
                                  No users found
                                </td>
                              </tr>
                            );
                          }
                          return displayed.map((u) => (
                            <tr
                              key={u._id}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                    {(u.name ||
                                      u.email ||
                                      "?")[0]?.toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {u.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {u.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {u.email}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {getCompanyName(u.companyId || u.company)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {getBrandName(u.brandId)}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wide shadow-sm ${getRoleClass(u.role)}`}
                                >
                                  {u.role}
                                </span>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
export default UserManagement;

function InputGroup({ label, placeholder, value, onChange, type = "text", required = true }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700 ml-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all font-medium"
        required={required}
      />
    </div>
  );
}
