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
import API_BASE_URL from "../../config/api";
import { useNavigate, useLocation } from "react-router-dom";
import { debounce } from "../../utils/helper";
import TablePagination from "../../components/TablePagination";

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
  const [userPage, setUserPage] = useState(1);
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userRole: "creator",
    // legacy single-brand field kept for compatibility; prefer brandIds for multi-select
    brandId: "",
    brandIds: [],
    allBrands: false,
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
    category: "",
    country: "",
    city: "",
    cinGst: "",
    registerOfficeAddress: "",
    courierAddress: "",
    dispatchAddress: "",
    email: "", // support mail
    supportNumber: "",
    phoneNumber: "", // contact number
    contactPersonName: "",
  });
  const [officialEmails, setOfficialEmails] = useState([{ value: "", otpSent: false, otp: "", verified: false, sending: false, verifying: false }]);
  const [authorizerEmails, setAuthorizerEmails] = useState([{ value: "", password: "", otpSent: false, otp: "", verified: false, sending: false, verifying: false }]);
  const [creatorEmails, setCreatorEmails] = useState([{ value: "", password: "", otpSent: false, otp: "", verified: false, sending: false, verifying: false }]);
  const [companyBrands, setCompanyBrands] = useState([
    { brandName: "", brandLogo: "", logoType: "url" },
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
        };
        // Prefer sending an array of brandIds when available (multi-select)
        if (Array.isArray(formData.brandIds) && formData.brandIds.length > 0) {
          payload.brandIds = formData.brandIds;
        } else if (formData.brandId) {
          payload.brandId = formData.brandId;
        }
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

    // Validate all official emails are verified
    const filledOfficials = officialEmails.filter(e => e.value.trim());
    if (filledOfficials.length === 0) {
      alert('Please add at least one official email ID');
      return;
    }
    const unverifiedOfficials = filledOfficials.filter(e => !e.verified);
    if (unverifiedOfficials.length > 0) {
      alert('Please verify all official email IDs before creating the company');
      return;
    }

    // Validate brands
    const validBrands = companyBrands.filter(b => b.brandName && b.brandName.trim());
    if (validBrands.length === 0) {
      alert('Please add at least one brand');
      return;
    }

    try {
      const payload = {
        ...companyForm,
        officialEmails: filledOfficials.map(e => e.value.trim()),
        authorizerEmails: authorizerEmails.filter(e => e.value.trim()).map(e => ({ email: e.value.trim(), password: e.password || '' })),
        creatorEmails: creatorEmails.filter(e => e.value.trim()).map(e => ({ email: e.value.trim(), password: e.password || '' })),
        brands: validBrands.map(b => ({ brandName: b.brandName, brandLogo: b.brandLogo })),
      };
      const res = await createCompany(payload, token);
      alert('Company created successfully');
      // reset form
      setCompanyForm({
        companyName: "",
        legalEntity: "",
        companyWebsite: "",
        industry: "",
        category: "",
        country: "",
        city: "",
        cinGst: "",
        registerOfficeAddress: "",
        courierAddress: "",
        dispatchAddress: "",
        email: "",
        supportNumber: "",
        phoneNumber: "",
        contactPersonName: "",
      });
      setOfficialEmails([{ value: "", otpSent: false, otp: "", verified: false, sending: false, verifying: false }]);
      setAuthorizerEmails([{ value: "", password: "", otpSent: false, otp: "", verified: false, sending: false, verifying: false }]);
      setCreatorEmails([{ value: "", password: "", otpSent: false, otp: "", verified: false, sending: false, verifying: false }]);
      setCompanyBrands([{ brandName: "", brandLogo: "", logoType: "url" }]);
      loadCompanies();
      if (res && res.company && res.company._id) loadBrandsForCompany(res.company._id);
    } catch (err) {
      alert('Error creating company: ' + (err.message || err));
    }
  };

  // Email OTP helpers
  const sendEmailOtp = async (email, listSetter, index) => {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    listSetter(prev => prev.map((e, i) => i === index ? { ...e, sending: true } : e));
    try {
      const res = await fetch(API_BASE_URL + '/admin/email-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        listSetter(prev => prev.map((e, i) => i === index ? { ...e, otpSent: true, sending: false } : e));
      } else {
        alert(data.message || 'Failed to send OTP');
        listSetter(prev => prev.map((e, i) => i === index ? { ...e, sending: false } : e));
      }
    } catch (err) {
      alert('Failed to send OTP');
      listSetter(prev => prev.map((e, i) => i === index ? { ...e, sending: false } : e));
    }
  };

  const verifyEmailOtp = async (email, otp, listSetter, index) => {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    listSetter(prev => prev.map((e, i) => i === index ? { ...e, verifying: true } : e));
    try {
      const res = await fetch(API_BASE_URL + '/admin/email-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        listSetter(prev => prev.map((e, i) => i === index ? { ...e, verified: true, verifying: false } : e));
      } else {
        alert(data.message || 'Invalid OTP');
        listSetter(prev => prev.map((e, i) => i === index ? { ...e, verifying: false } : e));
      }
    } catch (err) {
      alert('Verification failed');
      listSetter(prev => prev.map((e, i) => i === index ? { ...e, verifying: false } : e));
    }
  };

  const addCompanyBrandRow = () => {
    setCompanyBrands((s) => [...s, { brandName: "", brandLogo: "", logoType: "url" }]);
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
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Company Name *" placeholder="Acme Holdings" value={companyForm.companyName} onChange={(v)=>setCompanyForm({...companyForm, companyName: v})} />
              <InputGroup label="Category" placeholder="FMCG, Pharma..." value={companyForm.category} onChange={(v)=>setCompanyForm({...companyForm, category: v})} required={false} />
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="GST Number" placeholder="22AAAAA0000A1Z5" value={companyForm.cinGst} onChange={(v)=>setCompanyForm({...companyForm, cinGst: v})} required={false} />
              <InputGroup label="Website" placeholder="https://..." value={companyForm.companyWebsite} onChange={(v)=>setCompanyForm({...companyForm, companyWebsite: v})} required={false} />
            </div>

            {/* Official Emails */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 ml-1">Official Email IDs *</label>
                <button type="button" onClick={() => setOfficialEmails(prev => [...prev, { value: "", otpSent: false, otp: "", verified: false, sending: false, verifying: false }])}
                  className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Add
                </button>
              </div>
              <div className="space-y-2">
                {officialEmails.map((entry, idx) => (
                  <EmailRow key={idx} entry={entry} idx={idx} emails={officialEmails} setEmails={setOfficialEmails} showOtp={true} onSendOtp={sendEmailOtp} onVerifyOtp={verifyEmailOtp} />
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 ml-1">Brands *</label>
                <button type="button" onClick={addCompanyBrandRow}
                  className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Add Brand
                </button>
              </div>
              {companyBrands.map((b, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3 p-3 border border-gray-100 rounded-xl bg-white">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700 ml-1">Brand Name *</label>
                      <input value={b.brandName} onChange={e => updateCompanyBrandRow(idx, 'brandName', e.target.value)}
                        placeholder="Brand name" required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all font-medium" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700 ml-1">Brand Logo (URL/File) *</label>
                      <div className="flex items-center gap-2">
                        <div className="flex bg-gray-100 rounded-lg p-0.5 flex-shrink-0">
                          <button type="button" onClick={() => updateCompanyBrandRow(idx, 'logoType', 'url')}
                            className={"px-2 py-1 rounded-md text-[11px] font-bold transition-all " + ((b.logoType || "url") === "url" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400")}>URL</button>
                          <button type="button" onClick={() => updateCompanyBrandRow(idx, 'logoType', 'file')}
                            className={"px-2 py-1 rounded-md text-[11px] font-bold transition-all " + ((b.logoType || "url") === "file" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400")}>File</button>
                        </div>
                        {(b.logoType || "url") === "url" ? (
                          <input value={b.brandLogo} onChange={e => updateCompanyBrandRow(idx, 'brandLogo', e.target.value)}
                            placeholder="https://..."
                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all" />
                        ) : (
                          <input type="file" accept="image/*"
                            onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onloadend = () => updateCompanyBrandRow(idx, 'brandLogo', r.result); r.readAsDataURL(f); } }}
                            className="flex-1 text-sm text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-200 file:text-xs file:font-medium file:bg-gray-50 hover:file:bg-gray-100" />
                        )}
                        {b.brandLogo && <img src={b.brandLogo} alt="" className="w-9 h-9 object-contain border rounded-lg" onError={e => { e.target.style.display = 'none'; }} />}
                      </div>
                    </div>
                  </div>
                  {companyBrands.length > 1 && (
                    <button type="button" onClick={() => removeCompanyBrandRow(idx)}
                      className="self-end sm:self-start sm:mt-7 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Authorizer + Creator row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 ml-1">Authorizer Emails</label>
                  <button type="button" onClick={() => setAuthorizerEmails(prev => [...prev, { value: "", password: "", otpSent: false, otp: "", verified: false, sending: false, verifying: false }])}
                    className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Add
                  </button>
                </div>
                <div className="space-y-2">
                  {authorizerEmails.map((entry, idx) => (
                    <EmailRow key={idx} entry={entry} idx={idx} emails={authorizerEmails} setEmails={setAuthorizerEmails} showOtp={false} showPassword={true} onSendOtp={sendEmailOtp} onVerifyOtp={verifyEmailOtp} />
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 ml-1">Creator Emails</label>
                  <button type="button" onClick={() => setCreatorEmails(prev => [...prev, { value: "", password: "", otpSent: false, otp: "", verified: false, sending: false, verifying: false }])}
                    className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Add
                  </button>
                </div>
                <div className="space-y-2">
                  {creatorEmails.map((entry, idx) => (
                    <EmailRow key={idx} entry={entry} idx={idx} emails={creatorEmails} setEmails={setCreatorEmails} showOtp={false} showPassword={true} onSendOtp={sendEmailOtp} onVerifyOtp={verifyEmailOtp} />
                  ))}
                </div>
              </div>
            </div>

            {/* Address row */}
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Address *" placeholder="Registered office address" value={companyForm.registerOfficeAddress} onChange={(v)=>setCompanyForm({...companyForm, registerOfficeAddress: v})} />
              <InputGroup label="Courier Address *" placeholder="Courier / dispatch address" value={companyForm.courierAddress} onChange={(v)=>setCompanyForm({...companyForm, courierAddress: v})} />
            </div>
            {/* Phone row */}
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Contact Number *" placeholder="+91 98765 43210" value={companyForm.phoneNumber} onChange={(v)=>setCompanyForm({...companyForm, phoneNumber: v})} />
              <InputGroup label="Support Number *" placeholder="+91 1800 XXX XXX" value={companyForm.supportNumber} onChange={(v)=>setCompanyForm({...companyForm, supportNumber: v})} />
            </div>
            {/* Email + person row */}
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Support Mail ID *" type="email" placeholder="support@company.com" value={companyForm.email} onChange={(v)=>setCompanyForm({...companyForm, email: v})} />
              <InputGroup label="Contact Person" placeholder="Name" value={companyForm.contactPersonName} onChange={(v)=>setCompanyForm({...companyForm, contactPersonName: v})} required={false} />
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
            <MultiBrandSelect
              brands={brands}
              value={formData.brandIds}
              onChange={(arr) => setFormData({ ...formData, brandIds: arr, allBrands: false })}
              allBrands={formData.allBrands}
              setAllBrands={(checked) => {
                if (checked) setFormData({ ...formData, allBrands: true, brandIds: brands.map((b) => String(b._id)) });
                else setFormData({ ...formData, allBrands: false, brandIds: [] });
              }}
              placeholder="Select brand(s)"
            />
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
                      <MultiBrandSelect
                        brands={brands}
                        value={formData.brandIds}
                        onChange={(arr) => setFormData({ ...formData, brandIds: arr, allBrands: false })}
                        allBrands={formData.allBrands}
                        setAllBrands={(checked) => {
                          if (checked) setFormData({ ...formData, allBrands: true, brandIds: brands.map((b) => String(b._id)) });
                          else setFormData({ ...formData, allBrands: false, brandIds: [] });
                        }}
                        placeholder="Select brand(s)"
                      />
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
                                  colSpan={5}
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
                                  colSpan={5}
                                  className="px-8 py-12 text-center text-gray-400"
                                >
                                  No users found
                                </td>
                              </tr>
                            );
                          }
                          const startIdx = (userPage - 1) * userRowsPerPage;
                          const paginated = displayed.slice(startIdx, startIdx + userRowsPerPage);
                          return (
                            <>
                              {paginated.map((u) => (
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
                          ))}
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                  {(() => {
                    const q = query.trim().toLowerCase();
                    const displayed = q
                      ? staff.filter(
                          (u) =>
                            (u.name || "").toLowerCase().includes(q) ||
                            (u.email || "").toLowerCase().includes(q),
                        )
                      : staff;
                    return (
                      <TablePagination
                        totalItems={staff.length}
                        filteredCount={displayed.length}
                        currentPage={userPage}
                        rowsPerPage={userRowsPerPage}
                        onPageChange={setUserPage}
                        onRowsPerPageChange={(n) => { setUserRowsPerPage(n); setUserPage(1); }}
                        itemLabel="users"
                      />
                    );
                  })()}
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

function EmailRow({ entry, idx, emails, setEmails, showOtp, showPassword, onSendOtp, onVerifyOtp }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input type="email" placeholder="email@company.com" value={entry.value}
        onChange={e => setEmails(prev => prev.map((x, i) => i === idx ? { ...x, value: e.target.value, otpSent: false, verified: false, otp: "" } : x))}
        disabled={entry.verified}
        className={"flex-1 min-w-[180px] px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all font-medium " + (entry.verified ? "bg-green-50 border-green-300 text-green-700" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400")}
      />
      {showPassword && (
        <input type="password" placeholder="Password" value={entry.password || ''}
          onChange={e => setEmails(prev => prev.map((x, i) => i === idx ? { ...x, password: e.target.value } : x))}
          className="w-36 px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all font-medium placeholder:text-gray-400"
        />
      )}
      {showOtp && entry.verified && (
        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>Verified
        </span>
      )}
      {showOtp && !entry.otpSent && !entry.verified && (
        <button type="button" disabled={!entry.value || entry.sending} onClick={() => onSendOtp(entry.value, setEmails, idx)}
          className="px-3 py-2 bg-gray-900 text-white rounded-xl text-xs font-medium hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap">
          {entry.sending ? "Sending..." : "Send OTP"}
        </button>
      )}
      {showOtp && entry.otpSent && !entry.verified && (
        <>
          <input type="text" maxLength={6} placeholder="OTP" value={entry.otp}
            onChange={e => setEmails(prev => prev.map((x, i) => i === idx ? { ...x, otp: e.target.value.replace(/\D/g, '').slice(0, 6) } : x))}
            className="w-24 px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
          <button type="button" disabled={entry.otp.length !== 6 || entry.verifying}
            onClick={() => onVerifyOtp(entry.value, entry.otp, setEmails, idx)}
            className="px-3 py-2 bg-gray-900 text-white rounded-xl text-xs font-medium hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap">
            {entry.verifying ? "..." : "Verify"}
          </button>
          <button type="button" onClick={() => onSendOtp(entry.value, setEmails, idx)}
            className="text-xs text-gray-500 hover:text-gray-800 font-medium whitespace-nowrap">Resend</button>
        </>
      )}
      {emails.length > 1 && !entry.verified && (
        <button type="button" onClick={() => setEmails(prev => prev.filter((_, i) => i !== idx))}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Remove">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
}

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

function MultiBrandSelect({ brands = [], value = [], onChange, allBrands = false, setAllBrands = () => {}, placeholder = 'Select' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const list = (brands || []).filter((b) => (b.brandName || '').toLowerCase().includes(query.toLowerCase()));

  const toggle = (id) => {
    const arr = Array.isArray(value) ? [...value] : [];
    const idx = arr.findIndex((x) => String(x) === String(id));
    if (idx > -1) arr.splice(idx, 1);
    else arr.push(String(id));
    onChange(arr);
  };

  const clearOne = (id) => {
    const arr = (value || []).filter((x) => String(x) !== String(id));
    onChange(arr);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const all = (brands || []).map((b) => String(b._id));
      onChange(all);
      setAllBrands(true);
    } else {
      onChange([]);
      setAllBrands(false);
    }
  };

  const selectedNames = (value || []).map((id) => {
    const b = (brands || []).find((x) => String(x._id) === String(id));
    return b ? b.brandName : id;
  });

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={`w-full text-left px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2 ${brands.length === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
        disabled={brands.length === 0}
        aria-haspopup="listbox"
      >
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          {selectedNames.length === 0 ? (
            <span className="text-sm text-gray-400">{placeholder}</span>
          ) : (
            selectedNames.map((n, i) => (
              <span key={i} className="inline-flex items-center bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                {n}
                <button type="button" onClick={(e) => { e.stopPropagation(); clearOne(value[i]); }} className="ml-2 text-gray-500 hover:text-gray-700">✕</button>
              </span>
            ))
          )}
        </div>
        <div className="text-gray-400">▾</div>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="inline-flex items-center text-sm">
              <input
                type="checkbox"
                className="mr-2"
                checked={allBrands || ((brands || []).length > 0 && (value || []).length === (brands || []).length)}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              Select all
            </label>
            <input
              placeholder="Search brands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm"
            />
          </div>

          <div className="max-h-56 overflow-auto">
            {(list.length === 0) && <div className="text-sm text-gray-500 py-2">No brands</div>}
            {list.map((b) => {
              const id = String(b._id);
              const checked = (value || []).some((x) => String(x) === id);
              return (
                <label key={id} className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                  <input type="checkbox" checked={checked} onChange={() => toggle(id)} className="mr-2" />
                  <div className="flex-1 text-sm text-gray-800">{b.brandName}</div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
