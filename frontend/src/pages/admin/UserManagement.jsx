import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  createCompanyUser,
  createStaffUser,
  getStaffUsers,
  createBrand,
  getBrands,
  createCompany,
  getCompanies,
  getBrandsForCompany,
  getCompanyById,
  updateBrand,
  updateCompany,
  updateStaffUser
} from "../../config/api";
import API_BASE_URL from "../../config/api";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { maskPhoneNumber, debounce } from "../../utils/helper";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("list"); // 'list', 'create', 'createBrand', 'createStaff'
  const [roleTab, setRoleTab] = useState(searchParams.get("tab") || "staff"); // 'staff', 'company', 'authorizer', 'creator', 'user'
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [, setLoadingBrands] = useState(false);
  const [query, setQuery] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);
  const [editingUser, setEditingUser] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);



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
    brandLogoFile: null, // Local file
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
  const [editingBrand, setEditingBrand] = useState(null); // { id, data }

  const resetData = {
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
  };

  const resetBrandData = {
    brandName: "",
    legalEntity: "",
    brandLogo: "",
    brandLogoFile: null,
    logoType: "url",
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
  };

  const uploadToCloudinary = async (file) => {
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      if (!cloudName || !uploadPreset) return null;

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: uploadFormData,
      });
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return null;
    }
  };


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
        // If no explicit level filter, but on the 'user' tab, fetch only 'user' role
        if (!params.role && roleTab === 'user') {
          params.role = 'user';
        }
        
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
              } catch (e) { }
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
      const data = await getBrands();
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

  // helper to map brandId to name
  const getBrandName = (id) => {
    const b = brands.find((brand) => String(brand._id) === String(id));
    return b ? b.brandName : "N/A";
  };

  // helper to map companyId to name
  const getCompanyName = (id) => {
    if (!id) return "-";
    // if populated object
    if (typeof id === "object" && id.companyName) return id.companyName;
    const c = companies.find((x) => String(x._id) === String(id));
    return c ? c.companyName || "-" : "-";
  };

  const handleToggleBrandStatus = async (item) => {
    const newStatus = item.status === 'blocked' ? 'active' : 'blocked';
    const confirmMsg = `Are you sure you want to ${newStatus === 'blocked' ? 'block' : 'unblock'} ${item.brandName}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      await updateBrand(item._id, { status: newStatus }, token);
      alert(`Brand ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`);
      loadBrands();
    } catch (e) {
      alert("Failed to update brand status: " + e.message);
    }
  };

  const handleEditBrand = async (brand) => {
    setEditingUser(null);
    setEditingBrand({ id: brand._id, data: brand });
    
    // Set basic brand form for backward compatibility/non-admin view
    setBrandForm({
      brandName: brand.brandName || "",
      legalEntity: brand.legalEntity || "",
      brandLogo: brand.brandLogo || "",
      brandWebsite: brand.brandWebsite || "",
      industry: brand.industry || "",
      country: brand.country || "",
      city: brand.city || "",
      cinGst: brand.cinGst || "",
      registerOfficeAddress: brand.registerOfficeAddress || "",
      dispatchAddress: brand.dispatchAddress || "",
      email: brand.email || "",
      phoneNumber: brand.phoneNumber || "",
      supportNumber: brand.supportNumber || "",
      contactPersonName: brand.contactPersonName || "",
      brandLogoFile: null,
      logoType: "url",
    });

    const companyId = brand.companyId?._id || brand.companyId || "";
    setSelectedCompany(companyId);

    // If admin/superadmin, we want the full Enterprise Edit UI
    if (companyId && (role === 'admin' || role === 'superadmin')) {
      try {
        const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
        const company = await getCompanyById(companyId, token);
        
        // Set editingCompany to trigger the full Enterprise UI (Request #2 from user)
        setEditingCompany(company);
        setEditingBrand(null); // Switch to company mode for full UI
        
        setCompanyForm({
          companyName: company.companyName || "",
          legalEntity: company.legalEntity || "",
          companyWebsite: company.companyWebsite || company.website || "",
          industry: company.industry || "",
          category: company.category || "",
          country: company.country || "",
          city: company.city || "",
          cinGst: company.cinGst || "",
          registerOfficeAddress: company.registerOfficeAddress || "",
          courierAddress: company.courierAddress || company.dispatchAddress || "",
          dispatchAddress: company.dispatchAddress || "",
          email: company.email || "",
          supportNumber: company.supportNumber || "",
          phoneNumber: company.phoneNumber || "",
          contactPersonName: company.contactPersonName || "",
        });

        // Prefill emails from company
        if (company.officialEmails?.length > 0) {
          setOfficialEmails(company.officialEmails.map(email => ({ value: email, otpSent: true, verified: true, sending: false, verifying: false })));
        }
        if (company.authorizerEmails?.length > 0) {
          setAuthorizerEmails(company.authorizerEmails.map(email => ({ value: email, password: "", otpSent: true, verified: true, sending: false, verifying: false })));
        }
        if (company.creatorEmails?.length > 0) {
          setCreatorEmails(company.creatorEmails.map(email => ({ value: email, password: "", otpSent: true, verified: true, sending: false, verifying: false })));
        }

        // Prefill multiple brands from same company
        try {
          const bData = await getBrandsForCompany(token, companyId);
          if (bData && Array.isArray(bData) && bData.length > 0) {
            setCompanyBrands(bData.map(b => ({ 
              brandName: b.brandName || "", 
              brandLogo: b.brandLogo || "", 
              logoType: "url", 
              _id: b._id 
            })));
          } else {
            // Fallback to current brand if API returns nothing but we are in admin mode
            setCompanyBrands([{ 
              brandName: brand.brandName || "", 
              brandLogo: brand.brandLogo || "", 
              logoType: "url", 
              _id: brand._id 
            }]);
          }
        } catch (err) {
          console.warn("Failed to fetch all company brands, using current brand only", err);
          setCompanyBrands([{ 
            brandName: brand.brandName || "", 
            brandLogo: brand.brandLogo || "", 
            logoType: "url", 
            _id: brand._id 
          }]);
        }
      } catch (e) {
        console.warn("Failed to load company context for unified edit UI", e);
      }
    }

    setActiveTab("create");
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "", // Keep password empty for security, only update if provided
      userRole: user.role || "creator",
      brandId: user.brandId?._id || user.brandId || "",
      brandIds: Array.isArray(user.brandIds) ? user.brandIds.map(b => b._id || b) : [],
    });
    setSelectedCompany(user.companyId?._id || user.companyId || "");
    setActiveTab("createStaff");
  };
  
  const handleEditCompany = async (company) => {
    setEditingUser(null);
    setEditingBrand(null);
    setEditingCompany(company);
    setCompanyForm({
      companyName: company.companyName || "",
      legalEntity: company.legalEntity || "",
      companyWebsite: company.companyWebsite || company.website || "",
      industry: company.industry || "",
      category: company.category || "",
      country: company.country || "",
      city: company.city || "",
      cinGst: company.cinGst || "",
      registerOfficeAddress: company.registerOfficeAddress || "",
      courierAddress: company.courierAddress || "",
      dispatchAddress: company.dispatchAddress || "",
      email: company.email || "",
      supportNumber: company.supportNumber || "",
      phoneNumber: company.phoneNumber || "",
      contactPersonName: company.contactPersonName || "",
    });

    // Prefill emails
    if (company.officialEmails?.length > 0) {
      setOfficialEmails(company.officialEmails.map(email => ({ value: email, otpSent: true, verified: true, sending: false, verifying: false })));
    } else {
      setOfficialEmails([{ value: "", otpSent: false, otp: "", verified: false, sending: false, verifying: false }]);
    }

    if (company.authorizerEmails?.length > 0) {
      setAuthorizerEmails(company.authorizerEmails.map(email => ({ value: email, password: "", otpSent: true, verified: true, sending: false, verifying: false })));
    } else {
      setAuthorizerEmails([{ value: "", password: "", otpSent: false, otp: "", verified: false, sending: false, verifying: false }]);
    }

    if (company.creatorEmails?.length > 0) {
      setCreatorEmails(company.creatorEmails.map(email => ({ value: email, password: "", otpSent: true, verified: true, sending: false, verifying: false })));
    } else {
      setCreatorEmails([{ value: "", password: "", otpSent: false, otp: "", verified: false, sending: false, verifying: false }]);
    }

    // Prefill brands
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const bData = await getBrandsForCompany(token, company._id);
      if (bData && Array.isArray(bData) && bData.length > 0) {
        setCompanyBrands(bData.map(b => ({ 
          brandName: b.brandName || "", 
          brandLogo: b.brandLogo || "", 
          logoType: "url", 
          _id: b._id 
        })));
      } else {
        setCompanyBrands([{ brandName: "", brandLogo: "", logoType: "url" }]);
      }
    } catch (e) {
      console.warn("Failed to load brands for company edit", e);
      setCompanyBrands([{ brandName: "", brandLogo: "", logoType: "url" }]);
    }

    setActiveTab("create");
  };

  const handleViewBrandUsers = (brand) => {
    setRoleTab("staff");
    setBrandFilter(brand._id);
    setQuery("");
    setActiveTab("list");
    loadStaff({ brandId: brand._id });
  };


  // --- Effects (placed after definitions to avoid initialization errors) ---

  // Sync roleTab with searchParams
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== roleTab) {
      setRoleTab(tab);
      // Clear filters when switching contexts to avoid stuck results
      setBrandFilter("");
      setLevelFilter("");
      setCompanyFilter("");
      setUserPage(1);
    } else if (!tab && roleTab !== "staff") {
      // Handle the case where the user clicks the main "User Management" link
      setRoleTab("staff");
      setBrandFilter("");
      setLevelFilter("");
      setCompanyFilter("");
      setUserPage(1);
    }
  }, [searchParams, roleTab]);

  // Load data when roleTab changes
  useEffect(() => {
    if (role) {
      if (roleTab === "brand") {
        loadBrands();
      } else {
        loadStaff();
      }
    }
  }, [roleTab, role, loadStaff]);

  // Load brands and staff once based on already-initialized `role`.
  useEffect(() => {
    if (!role) return;
    // Admins and superadmins should be able to see companies/staff
    if (["admin", "superadmin", "company"].includes(role)) {
      loadBrands();
      // Load companies for superadmin/admin
      if (["admin", "superadmin"].includes(role)) loadCompanies();
    }
  }, [role]);

  // Ensure companies are loaded when switching to createBrand or createStaff tabs
  useEffect(() => {
    if (!role) return;
    if (["createBrand", "createStaff"].includes(activeTab) && ["admin", "superadmin"].includes(role)) {
      loadCompanies();
    }
  }, [activeTab, role]);

  // Load companies/brands when opening create or list tabs
  useEffect(() => {
    if (!role) return;
    const isSuperOrAdmin = ["admin", "superadmin"].includes(role);
    if (!isSuperOrAdmin) return;

    if (["createBrand", "createStaff", "list"].includes(activeTab)) {
      if (companies.length === 0) loadCompanies();
      if (brands.length === 0) loadBrands();
    }
  }, [activeTab, role, companies.length, brands.length]);



  // Read `tab` query param to initialize view (legacy support or direct links)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    // Only set activeTab if it's a structural tab (not a role filter)
    if (tab && ["create", "createBrand", "createStaff", "list"].includes(tab)) {
      setActiveTab(tab);
    } else if (tab) {
      // If it's a role filter (staff, company, user, etc), ensure we are in the list view
      setActiveTab("list");
    }
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
      } else if (editingUser) {
        // Update existing user
        const payload = {
          name: formData.name,
          email: formData.email,
          role: formData.userRole,
          brandIds: formData.brandIds,
          companyId: selectedCompany
        };
        if (formData.password) payload.password = formData.password;
        
        await updateStaffUser(editingUser._id, payload, token);
        alert("User Updated Successfully");
        setEditingUser(null);
        setActiveTab("list");
        loadStaff();
      } else {
        // Create staff
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.userRole,
        };
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
        brandIds: [],
        allBrands: false
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
      let finalBrandLogo = brandForm.brandLogo;
      if (brandForm.brandLogoFile) {
        const uploadedUrl = await uploadToCloudinary(brandForm.brandLogoFile);
        if (uploadedUrl) finalBrandLogo = uploadedUrl;
      }

      if (editingBrand) {
        const payload = { ...brandForm, brandLogo: finalBrandLogo };
        delete payload.brandLogoFile;
        // Ensure supportNumber is included
        payload.supportNumber = brandForm.supportNumber || "";
        if (selectedCompany) payload.companyId = selectedCompany;
        await updateBrand(editingBrand.id, payload, token);
        alert("Brand Updated Successfully");
        setEditingBrand(null);
        setActiveTab("list");
        loadBrands();
        return;
      }

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
          let rowLogo = r.brandLogo;
          if (r.logoType === 'upload' && r.logoFile) {
            const uploaded = await uploadToCloudinary(r.logoFile);
            if (uploaded) rowLogo = uploaded;
          }
          const payload = {
            brandName: r.brandName,
            brandLogo: rowLogo || null,
            companyId: selectedCompany,
          };
          const res = await createBrand(payload, token);
          created.push(res);
        }
        alert(`Created ${created.length} brand(s) successfully`);
        // reset brand rows
        setCompanyBrands([{ brandName: "", brandLogo: "", logoType: "url", logoFile: null }]);
        setActiveTab("list");
        loadBrands();
      } else {
        // fallback: single brand form
        const payload = { ...brandForm, brandLogo: finalBrandLogo };
        delete payload.brandLogoFile;
        payload.supportNumber = brandForm.supportNumber || "";
        if (selectedCompany) payload.companyId = selectedCompany;
        await createBrand(payload, token);
        alert("Brand Created Successfully");
        setBrandForm({
          brandName: "",
          legalEntity: "",
          brandLogo: "",
          brandLogoFile: null,
          brandWebsite: "",
          industry: "",
          country: "",
          city: "",
          cinGst: "",
          registerOfficeAddress: "",
          dispatchAddress: "",
          email: "",
          phoneNumber: "",
          supportNumber: "",
          contactPersonName: "",
        });
        setActiveTab("list");
        loadBrands();
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };


  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

    // Validate all official emails
    const filledOfficials = officialEmails.filter(e => e.value.trim());
    if (filledOfficials.length === 0) {
      alert('Please add at least one official email ID');
      return;
    }

    // Validate brands
    const validBrands = companyBrands.filter(b => b.brandName && b.brandName.trim());
    if (validBrands.length === 0) {
      alert('Please add at least one brand');
      return;
    }

    try {
      // Handle Logo Uploads for each Brand Row
      const updatedBrands = [];
      for (const b of companyBrands) {
        if (!b.brandName?.trim()) continue;
        let finalLogo = b.brandLogo || "";
        if (b.logoType === 'upload' && b.logoFile) {
          const uploadedUrl = await uploadToCloudinary(b.logoFile);
          if (uploadedUrl) finalLogo = uploadedUrl;
        }
        updatedBrands.push({ 
          _id: b._id,
          brandName: b.brandName.trim(), 
          brandLogo: finalLogo 
        });
      }

      const payload = {
        ...companyForm,
        officialEmails: filledOfficials.map(e => e.value.trim()),
        authorizerEmails: authorizerEmails.filter(e => e.value.trim()).map(e => ({ email: e.value.trim(), password: e.password || '' })),
        creatorEmails: creatorEmails.filter(e => e.value.trim()).map(e => ({ email: e.value.trim(), password: e.password || '' })),
        brands: updatedBrands,
        contactPersonName: "",
      };
      
      if (editingCompany) {
        await updateCompany(editingCompany._id, payload, token);
        alert('Company updated successfully');
        setEditingCompany(null);
        setActiveTab("list");
      } else {
        await createCompany(payload, token);
        alert('Company created successfully');
      }
      
      // reset form
      setCompanyForm(resetData);
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
    setCompanyBrands((s) => [...s, { brandName: "", brandLogo: "", logoType: "url", logoFile: null }]);
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
      case "user":
        return "bg-emerald-600 text-white font-bold tracking-tight";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Render the create panel depending on role
  const renderCreateSection = () => {
    if (role === 'superadmin' || role === 'admin') {
      return (
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/40 max-w-5xl mx-auto animate-in fade-in zoom-in duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {editingCompany ? `Edit Enterprise Entity: ${editingCompany.companyName}` : 
                 editingBrand ? `Edit Brand: ${editingBrand.data.brandName}` : 
                 'Create Company'}
              </h2>
              <p className="text-gray-500 font-medium text-sm">
                {editingCompany ? 'Modify global settings, associated brands, and authorized access for this enterprise.' : 
                 editingBrand ? 'Update brand identity and information.' : 
                 'Establish a new enterprise identity and brand ecosystem.'}
              </p>
            </div>
            {(editingCompany || editingBrand) && (
              <button 
                onClick={() => {
                  setEditingUser(null);
                  setEditingCompany(null);
                  setEditingBrand(null);
                  setCompanyForm({
                    companyName: "", legalEntity: "", companyWebsite: "", industry: "", category: "",
                    country: "", city: "", cinGst: "", registerOfficeAddress: "", courierAddress: "",
                    dispatchAddress: "", email: "", supportNumber: "", phoneNumber: "", contactPersonName: ""
                  });
                  setBrandForm({
                    brandName: "", legalEntity: "", brandLogo: "", brandWebsite: "", industry: "",
                    country: "", city: "", cinGst: "", registerOfficeAddress: "", dispatchAddress: "",
                    email: "", phoneNumber: "", supportNumber: "", contactPersonName: "", brandLogoFile: null
                  });
                  setOfficialEmails([{ value: "", otpSent: false, otp: "", verified: false, sending: false, verifying: false }]);
                  setAuthorizerEmails([{ value: "", password: "", otpSent: false, otp: "", verified: false, sending: false, verifying: false }]);
                  setCreatorEmails([{ value: "", password: "", otpSent: false, otp: "", verified: false, sending: false, verifying: false }]);
                  setCompanyBrands([{ brandName: "", brandLogo: "", logoType: "url", logoFile: null }]);
                  setActiveTab("list");
                }}
                className="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={editingBrand ? handleBrandSubmit : handleCompanySubmit} className="space-y-8">
            {/* Admin context: Select Company if not editing */}
            {role === 'admin' && !editingBrand && !editingCompany && (
              <div className="p-6 bg-gray-50 border border-gray-100 rounded-[2rem]">
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Assigned Company</label>
                <select
                  className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900"
                  value={selectedCompany}
                  onChange={(e) => {
                    const cid = e.target.value;
                    setSelectedCompany(cid);
                    setBrandForm({ ...brandForm, companyId: cid });
                  }}
                  required
                >
                  <option value="">Select Company Context</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>{c.companyName}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50/30 rounded-[2rem] border border-blue-100/50">
              <InputGroup 
                label={editingBrand ? "Brand Name *" : "Entity Name *"} 
                placeholder={editingBrand ? "Brand Name" : "Company Legal Name"} 
                value={editingBrand ? brandForm.brandName : companyForm.companyName} 
                onChange={(v) => editingBrand ? setBrandForm({ ...brandForm, brandName: v }) : setCompanyForm({ ...companyForm, companyName: v })} 
              />
              <InputGroup 
                label="Website" 
                placeholder="https://www.company.com" 
                value={editingBrand ? brandForm.brandWebsite : companyForm.brandWebsite} 
                onChange={(v) => editingBrand ? setBrandForm({ ...brandForm, brandWebsite: v }) : setCompanyForm({ ...companyForm, brandWebsite: v })} 
                required={false} 
              />
              <InputGroup 
                label="Industry" 
                placeholder="e.g. Manufacturing, Retail" 
                value={editingBrand ? brandForm.industry : companyForm.industry} 
                onChange={(v) => editingBrand ? setBrandForm({ ...brandForm, industry: v }) : setCompanyForm({ ...companyForm, industry: v })} 
                required={false} 
              />
              <InputGroup 
                label="CIN / GST Number" 
                placeholder="Registration ID" 
                value={editingBrand ? brandForm.cinGst : companyForm.cinGst} 
                onChange={(v) => editingBrand ? setBrandForm({ ...brandForm, cinGst: v }) : setCompanyForm({ ...companyForm, cinGst: v })} 
                required={false} 
              />
              
              {editingBrand && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-blue-100/50">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1 block">Logo Option</label>
                    <div className="flex p-1 bg-gray-100 rounded-xl">
                      <button type="button" onClick={() => setBrandForm({ ...brandForm, logoType: 'url' })} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${brandForm.logoType === 'url' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>URL</button>
                      <button type="button" onClick={() => setBrandForm({ ...brandForm, logoType: 'upload' })} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${brandForm.logoType === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Upload</button>
                    </div>
                  </div>
                  
                  <div>
                    {brandForm.logoType === 'url' ? (
                      <InputGroup label="Logo URL" placeholder="https://..." value={brandForm.brandLogo} onChange={(v) => setBrandForm({ ...brandForm, brandLogo: v })} type="url" required={false} />
                    ) : (
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1 block">Upload Logo</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setBrandForm({ ...brandForm, brandLogoFile: e.target.files?.[0] })}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all border border-gray-200 rounded-2xl p-1 bg-white"
                        />
                      </div>
                    )}
                  </div>
                  
                  {(brandForm.brandLogo || brandForm.brandLogoFile) && (
                    <div className="md:col-span-2 flex items-center gap-3 p-3 bg-white/50 rounded-2xl border border-blue-100">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-white bg-white shadow-sm shrink-0">
                        <img 
                          src={brandForm.brandLogoFile ? URL.createObjectURL(brandForm.brandLogoFile) : brandForm.brandLogo} 
                          alt="Preview" 
                          className="w-full h-full object-contain"
                          onError={(e) => { e.currentTarget.src = "/placeholder-logo.png"; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-0.5">Logo Preview</p>
                        <p className="text-xs font-bold text-gray-600 truncate">
                          {brandForm.brandLogoFile ? brandForm.brandLogoFile.name : brandForm.brandLogo}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Brands Section (Enabled for creating and editing company/brand) */}
            {!editingBrand && (
              <div className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">Brands</h4>
                    <p className="text-xs text-gray-500 font-medium">{editingCompany ? 'Brands associated with this company' : 'Add at least one brand for this company'}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={addCompanyBrandRow}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Add Brand
                  </button>
                </div>

                <div className="space-y-4">
                  {companyBrands.map((b, idx) => (
                    <div key={idx} className="group flex flex-col items-start gap-4 p-5 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputGroup label={`Brand ${idx + 1} Name *`} placeholder="Brand Name" value={b.brandName} onChange={(v) => updateCompanyBrandRow(idx, 'brandName', v)} />
                        
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 ml-1 block">Logo Option</label>
                          <div className="flex p-1 bg-gray-100 rounded-xl">
                            <button type="button" onClick={() => updateCompanyBrandRow(idx, 'logoType', 'url')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${b.logoType === 'url' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>URL</button>
                            <button type="button" onClick={() => updateCompanyBrandRow(idx, 'logoType', 'upload')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${b.logoType === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Upload</button>
                          </div>
                        </div>

                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            {b.logoType === 'url' ? (
                              <InputGroup label="Logo URL" placeholder="https://..." value={b.brandLogo} onChange={(v) => updateCompanyBrandRow(idx, 'brandLogo', v)} type="url" required={false} />
                            ) : (
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1 block">Upload Logo</label>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => updateCompanyBrandRow(idx, 'logoFile', e.target.files?.[0])}
                                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all border border-gray-200 rounded-2xl p-1 bg-white"
                                />
                              </div>
                            )}
                          </div>
                          {companyBrands.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeCompanyBrandRow(idx)}
                              className="mb-1 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" 
                              title="Remove"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Logo Preview */}
                      {(b.brandLogo || b.logoFile) && (
                        <div className="mt-2 flex items-center gap-3 p-2 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-white bg-white shadow-sm shrink-0">
                            <img 
                              src={b.logoFile ? URL.createObjectURL(b.logoFile) : b.brandLogo} 
                              alt="Logo" 
                              className="w-full h-full object-contain"
                              onError={(e) => { e.currentTarget.src = "/placeholder-logo.png"; }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-gray-500 truncate max-w-[150px]">
                            {b.logoFile ? b.logoFile.name : b.brandLogo.split('/').pop()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Platform Users (Only for creating company) */}
            {/* Platform Users (Enabled for creating and editing company/brand) */}
            {!editingBrand && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-purple-50/30 rounded-[2rem] border border-purple-100/50">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-bold text-gray-700 ml-1">Authorizer Emails</label>
                    <button type="button" onClick={() => setAuthorizerEmails(prev => [...prev, { value: "", password: "", otpSent: false, otp: "", verified: false, sending: false, verifying: false }])}
                      className="p-1.5 bg-white border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {authorizerEmails.map((entry, idx) => (
                      <EmailRow key={idx} entry={entry} idx={idx} emails={authorizerEmails} setEmails={setAuthorizerEmails} showOtp={false} showPassword={true} onSendOtp={sendEmailOtp} onVerifyOtp={verifyEmailOtp} />
                    ))}
                  </div>
                </div>
                
                <div className="p-6 bg-pink-50/30 rounded-[2rem] border border-pink-100/50">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-bold text-gray-700 ml-1">Creator Emails</label>
                    <button type="button" onClick={() => setCreatorEmails(prev => [...prev, { value: "", password: "", otpSent: false, otp: "", verified: false, sending: false, verifying: false }])}
                      className="p-1.5 bg-white border border-pink-200 text-pink-600 rounded-lg hover:bg-pink-600 hover:text-white transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {creatorEmails.map((entry, idx) => (
                      <EmailRow key={idx} entry={entry} idx={idx} emails={creatorEmails} setEmails={setCreatorEmails} showOtp={false} showPassword={true} onSendOtp={sendEmailOtp} onVerifyOtp={verifyEmailOtp} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Address Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-orange-50/30 rounded-[2rem] border border-orange-100/50">
              <InputGroup 
                label="Registered Office Address *" 
                placeholder="Full address" 
                value={editingBrand ? brandForm.registerOfficeAddress : companyForm.registerOfficeAddress} 
                onChange={(v) => editingBrand ? setBrandForm({ ...brandForm, registerOfficeAddress: v }) : setCompanyForm({ ...companyForm, registerOfficeAddress: v })} 
              />
              <InputGroup 
                label={editingBrand ? "Dispatch Address *" : "Courier Address *"} 
                placeholder={editingBrand ? "Shipping origin" : "Dispatch address"} 
                value={editingBrand ? brandForm.dispatchAddress : companyForm.courierAddress} 
                onChange={(v) => editingBrand ? setBrandForm({ ...brandForm, dispatchAddress: v }) : setCompanyForm({ ...companyForm, courierAddress: v })} 
              />
              <InputGroup 
                label="Phone Number *" 
                placeholder="+91 XXX XXX XXXX" 
                value={editingBrand ? brandForm.phoneNumber : companyForm.phoneNumber} 
                onChange={(v) => editingBrand ? setBrandForm({ ...brandForm, phoneNumber: v }) : setCompanyForm({ ...companyForm, phoneNumber: v })} 
              />
              <InputGroup 
                label="Support Number" 
                placeholder="1800-XXX-XXXX" 
                value={editingBrand ? brandForm.supportNumber : companyForm.supportNumber} 
                onChange={(v) => editingBrand ? setBrandForm({ ...brandForm, supportNumber: v }) : setCompanyForm({ ...companyForm, supportNumber: v })} 
                required={false} 
              />
            </div>

            <div className="pt-4">
              <button className="w-full bg-gradient-to-r from-gray-900 to-blue-900 text-white font-black py-4 rounded-[1.5rem] hover:shadow-2xl hover:shadow-blue-900/40 active:scale-[0.98] transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                {editingBrand ? 'Update Brand' : editingCompany ? 'Update Company Entry' : 'Create Enterprise Entity'}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            </div>
          </form>
        </div>
      );
    }
  };

  // Add Nav
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-[1700px] mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="animate-in slide-in-from-left duration-700">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
              {roleTab === 'user' ? (
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Mobile Consumers</span>
              ) : (
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900">User Management</span>
              )}
            </h2>
            <p className="text-gray-500 font-bold text-lg max-w-2xl">
              {roleTab === 'user' 
                ? 'High-precision monitoring and management of consumers registered via the mobile authentication ecosystem.' 
                : 'Centralized control center for managing enterprise users, global brands, and cross-functional staff access.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3 animate-in slide-in-from-right duration-700">
            {activeTab !== 'list' && (
              <button 
                onClick={() => setActiveTab('list')}
                className="px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-[1.25rem] font-black text-sm hover:bg-gray-50 transition-all uppercase tracking-widest"
              >
                View All Records
              </button>
            )}
            <button 
              onClick={() => setActiveTab(role === 'superadmin' ? 'create' : 'createStaff')}
              className="px-6 py-3 bg-gray-900 text-white rounded-[1.25rem] font-black text-sm hover:shadow-xl hover:shadow-gray-900/20 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              New Entry
            </button>
          </div>
        </header>

        <main className="flex-1">
          <div className="space-y-6">
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
                          {role === 'superadmin' && <option value="user">User (Mobile)</option>}
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
                renderCreateSection()
              )}

              {activeTab === 'create' && renderCreateSection()}

              {activeTab === "createStaff" && (
                <div className="bg-white rounded-2xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 ">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingUser ? 'Edit User' : 'Create Staff'}
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
                      placeholder={editingUser ? "Leave blank to keep same" : "••••••••"}
                      value={formData.password}
                      onChange={(v) =>
                        setFormData({ ...formData, password: v })
                      }
                      required={!editingUser}
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

                    <div className="flex gap-4">
                      <button className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-all shadow-lg">
                        {editingUser ? 'Update User' : 'Create User'}
                      </button>
                      {editingUser && (
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingUser(null);
                            setActiveTab("list");
                            setFormData({
                              name: "",
                              email: "",
                              password: "",
                              userRole: "creator",
                              brandId: "",
                              brandIds: [],
                              allBrands: false
                            });
                          }}
                          className="px-4 py-2 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "list" && (
                <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                      <h3 className="font-semibold text-gray-900 whitespace-nowrap mr-2">
                        {roleTab === 'user' ? 'Mobile Consumers' : roleTab === 'brand' ? 'Brand Management' : 'User Management'}
                      </h3>
                      {/* Sub-tabs removed as they are now in the sidebar */}
                    </div>
                    {(() => {
                      const filtered = staff.filter(u => {
                        if (roleTab === 'user') return u.role === 'user';
                        // Default list shows all EXCEPT mobile consumers
                        return u.role !== 'user';
                      });
                      return (
                        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full w-fit shrink-0 font-bold">
                          {roleTab === 'brand' ? brands.length : filtered.length} {roleTab === 'user' ? 'mobile users' : roleTab === 'brand' ? 'brands' : 'platform users'}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                          {roleTab === 'brand' ? (
                            <>
                              <th className="px-8 py-4">Brand Name</th>
                              <th className="px-6 py-4">Company (Legal Entity)</th>
                              <th className="px-6 py-4 text-center">QR Credits</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4 text-right">Actions</th>
                            </>
                          ) : (
                            <>
                              <th className="px-8 py-4">Name</th>
                              <th className="px-6 py-4">Email</th>
                              <th className="px-6 py-4">{roleTab === 'company' ? 'Legal Entity' : 'Company'}</th>
                              {roleTab !== 'company' && <th className="px-6 py-4">Brand</th>}
                              <th className="px-6 py-4">Role / Status</th>
                              <th className="px-6 py-4 text-right">Actions</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(() => {
                          const listByCategory = roleTab === 'brand' ? brands : (roleTab === 'company' && (role === 'superadmin' || role === 'admin')) ? companies : staff.filter(u => {
                            if (roleTab === 'user') return u.role === 'user';
                            if (roleTab === 'authorizer') return u.role === 'authorizer';
                            if (roleTab === 'creator') return u.role === 'creator';
                            return u.role !== 'user';
                          });
                          const q = query.trim().toLowerCase();
                          const displayed = listByCategory.filter(
                            (item) => {
                              // Filter by search query
                              if (q) {
                                const matchesSearch = roleTab === 'brand' 
                                  ? (item.brandName || "").toLowerCase().includes(q) || (item.companyId?.companyName || "").toLowerCase().includes(q)
                                  : roleTab === 'company' && companies.includes(item)
                                    ? (item.companyName || "").toLowerCase().includes(q) || (item.email || "").toLowerCase().includes(q)
                                    : (item.name || "").toLowerCase().includes(q) || (item.email || "").toLowerCase().includes(q) || (item.mobile || "").includes(q);
                                if (!matchesSearch) return false;
                              }
                              
                              // Filter by company dropdown
                              if (companyFilter) {
                                const itemCompanyId = roleTab === 'brand' 
                                  ? (item.companyId?._id || item.companyId)
                                  : (item.companyId?._id || item.companyId || item.company);
                                if (String(itemCompanyId) !== String(companyFilter)) return false;
                              }

                              // Filter by brand dropdown (for staff)
                              if (roleTab !== 'brand' && brandFilter) {
                                const itemBrandId = item.brandId?._id || item.brandId;
                                // also check brandIds array if exists
                                const inBrandIds = Array.isArray(item.brandIds) && item.brandIds.some(b => String(b._id || b) === String(brandFilter));
                                if (String(itemBrandId) !== String(brandFilter) && !inBrandIds) return false;
                              }

                              return true;
                            }
                          );

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
                              {paginated.map((item) => (
                                <tr
                                  key={item._id}
                                  className="hover:bg-gray-50/50 transition-colors"
                                >
                                  {roleTab === 'brand' ? (
                                    <>
                                      <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                          {item.brandLogo ? (
                                            <img src={item.brandLogo} alt="" className="w-8 h-8 rounded-lg object-contain bg-gray-50 border border-gray-100" />
                                          ) : (
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600">
                                              {item.brandName?.[0]?.toUpperCase()}
                                            </div>
                                          )}
                                          <div className="font-medium text-gray-900">{item.brandName}</div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-700">
                                        <div className="font-semibold">{item.companyId?.companyName || "N/A"}</div>
                                        <div className="text-[10px] text-gray-400">{item.companyId?.legalEntity || "-"}</div>
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-black">
                                          {item.companyId?.qrCredits?.toLocaleString() || 0}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.status === 'blocked' || item.companyId?.status === 'blocked' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                          {item.status === 'blocked' || item.companyId?.status === 'blocked' ? 'Blocked' : 'Active'}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                          <button 
                                            onClick={() => handleViewBrandUsers(item)}
                                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Users"
                                          >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                          </button>
                                          <button 
                                            onClick={() => handleEditBrand(item)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Brand"
                                          >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                          </button>
                                          {role !== 'superadmin' && (
                                            <button 
                                              onClick={() => handleToggleBrandStatus(item)}
                                              className={`p-1.5 rounded-lg transition-colors ${item.status === 'blocked' ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`} 
                                              title={item.status === 'blocked' ? 'Unblock' : 'Block'}
                                            >
                                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                                            </button>
                                          )}
                                        </div>
                                      </td>

                                    </>
                                  ) : (
                                    <>
                                      <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                            {(item.name || item.companyName ||
                                              item.email ||
                                              "?")[0]?.toUpperCase()}
                                          </div>
                                          <div>
                                            <div className="font-medium text-gray-900">
                                              {item.name || item.companyName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {item.email}
                                            </div>
                                            {item.phoneNumber && (
                                              <div className="text-[10px] text-gray-400 font-bold">
                                                {maskPhoneNumber(item.phoneNumber)}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-700">
                                        {item.email}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-700">
                                        {roleTab === 'company' ? item.legalEntity : getCompanyName(item.companyId || item.company)}
                                      </td>
                                      {roleTab !== 'company' && (
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                          {getBrandName(item.brandId)}
                                        </td>
                                      )}
                                      <td className="px-6 py-4">
                                        <span
                                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wide shadow-sm ${item.role ? getRoleClass(item.role) : (item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}`}
                                        >
                                          {item.role || item.status}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                          <button 
                                            onClick={() => roleTab === 'company' ? handleEditCompany(item) : handleEditUser(item)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"
                                          >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                          </button>
                                        </div>
                                      </td>
                                    </>
                                  )}
                                </tr>
                              ))}
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                  {(() => {
                    const listByCategory = roleTab === 'brand' ? brands : (roleTab === 'company' && (role === 'superadmin' || role === 'admin')) ? companies : staff.filter(u => {
                      if (roleTab === 'user') return u.role === 'user';
                      if (roleTab === 'authorizer') return u.role === 'authorizer';
                      if (roleTab === 'creator') return u.role === 'creator';
                      return u.role !== 'user';
                    });
                    const q = query.trim().toLowerCase();
                    const displayed = listByCategory.filter(
                      (item) => {
                        if (!q) return true;
                        if (roleTab === 'brand') return (item.brandName || "").toLowerCase().includes(q) || (item.companyId?.companyName || "").toLowerCase().includes(q);
                        if (roleTab === 'company') return (item.companyName || "").toLowerCase().includes(q) || (item.email || "").toLowerCase().includes(q);
                        return (item.name || "").toLowerCase().includes(q) || (item.email || "").toLowerCase().includes(q) || (item.mobile || "").includes(q);
                      }
                    );
                    return (
                      <TablePagination
                        totalItems={listByCategory.length}
                        filteredCount={displayed.length}
                        currentPage={userPage}
                        rowsPerPage={userRowsPerPage}
                        onPageChange={setUserPage}
                        onRowsPerPageChange={(n) => { setUserRowsPerPage(n); setUserPage(1); }}
                        itemLabel={roleTab === 'brand' ? "brands" : roleTab === 'company' ? "companies" : roleTab === 'user' ? "mobile users" : "platform users"}
                      />
                    );
                  })()}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
  );
};
export default UserManagement;

function EmailRow({ entry, idx, emails, setEmails, showOtp, showPassword, onSendOtp, onVerifyOtp }) {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3 p-1">
      <div className="flex-1 min-w-[220px] relative group">
        <input 
          type="email" 
          placeholder="email@company.com" 
          value={entry.value}
          onChange={e => setEmails(prev => prev.map((x, i) => i === idx ? { ...x, value: e.target.value, otpSent: false, verified: false, otp: "" } : x))}
          disabled={entry.verified}
          className={`w-full px-4 py-3 border rounded-2xl text-sm focus:outline-none transition-all font-semibold outline-none
            ${entry.verified 
              ? "bg-green-50/50 border-green-200 text-green-700 backdrop-blur-sm" 
              : "bg-white/60 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"}`}
        />
        {entry.verified && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="bg-green-500 text-white p-1 rounded-full shadow-lg shadow-green-500/20">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
        )}
      </div>

      {showPassword && (
        <div className="relative group">
          <input 
            type={showPwd ? "text" : "password"} 
            placeholder="Password" 
            value={entry.password || ''}
            onChange={e => setEmails(prev => prev.map((x, i) => i === idx ? { ...x, password: e.target.value } : x))}
            className="w-40 pl-4 pr-10 py-3 border border-gray-200 bg-white/60 backdrop-blur-sm rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold placeholder:text-gray-400 shadow-sm"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
            tabIndex={-1}
          >
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      )}

      {showOtp && !entry.otpSent && !entry.verified && (
        <button 
          type="button" 
          disabled={!entry.value || entry.sending} 
          onClick={() => onSendOtp(entry.value, setEmails, idx)}
          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-xs font-bold hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all whitespace-nowrap uppercase tracking-wider"
        >
          {entry.sending ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sending</span>
            </div>
          ) : "Send OTP"}
        </button>
      )}

      {showOtp && entry.otpSent && !entry.verified && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
          <input 
            type="text" 
            maxLength={6} 
            placeholder="******" 
            value={entry.otp}
            onChange={e => setEmails(prev => prev.map((x, i) => i === idx ? { ...x, otp: e.target.value.replace(/\D/g, '').slice(0, 6) } : x))}
            className="w-24 px-4 py-3 border border-blue-200 bg-blue-50/50 rounded-2xl text-sm font-bold text-center tracking-[0.2em] focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm" 
          />
          <button 
            type="button" 
            disabled={entry.otp.length !== 6 || entry.verifying}
            onClick={() => onVerifyOtp(entry.value, entry.otp, setEmails, idx)}
            className="px-5 py-3 bg-green-600 text-white rounded-2xl text-xs font-bold hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/20 active:scale-95 disabled:opacity-40 transition-all uppercase tracking-wider"
          >
            {entry.verifying ? "..." : "Verify"}
          </button>
          <button 
            type="button" 
            onClick={() => onSendOtp(entry.value, setEmails, idx)}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold px-2 py-1 transition-colors"
          >
            Resend
          </button>
        </div>
      )}

      {emails.length > 1 && !entry.verified && (
        <button 
          type="button" 
          onClick={() => setEmails(prev => prev.filter((_, i) => i !== idx))}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" 
          title="Remove"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
}

function InputGroup({ label, placeholder, value, onChange, type = "text", required = true, readOnly = false }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700 ml-1 block">
        {label}
        {required && <span className="w-1 h-1 bg-red-400 rounded-full" />}
      </label>
      <div className="relative group">
        <input
          type={isPassword && !showPassword ? "password" : "text"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => !readOnly && onChange(e.target.value)}
          readOnly={readOnly}
          className={`w-full px-5 py-3.5 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold shadow-sm
            ${isPassword ? 'pr-12' : ''} ${readOnly ? 'cursor-not-allowed opacity-80' : ''}`}
          required={required && !readOnly}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors p-1"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}

function MultiBrandSelect({ brands = [], value = [], onChange, allBrands = false, setAllBrands = () => { }, placeholder = 'Select' }) {
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
