import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, Filter, ShieldCheck, AlertTriangle, XCircle, HelpCircle, Calendar, Clock, ChevronRight, ArrowLeft, ScanLine } from "lucide-react";
import API_BASE_URL from "../../config/api";
import MobileNavbar from "../../components/MobileNavbar";

let cachedHistory = null;
let lastHistoryFetchTime = 0;

export default function ScanHistory() {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState(cachedHistory || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Scans");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("newest");
  const [isLoading, setIsLoading] = useState(!cachedHistory);
  const itemsPerPage = 20;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/scan/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          // Map data
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const mappedData = data.map((item) => {
            const dateObj = new Date(item.createdAt);
            const day = String(dateObj.getDate()).padStart(2, "0");
            const monthName = monthNames[dateObj.getMonth()];
            const year = dateObj.getFullYear();
            const timeStr = dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            });

            let type = "Verified";
            let statusLabel = "Verified";
            let statusText = "Verified Authentic";
            let badgeColor = "text-[#10B981]";
            let badgeBorder = "border-[#10B981]/30";
            let badgeBg = "bg-[#ECFDF5]";
            let statusIcon = "verified";
            let ribbonColor = "#10B981";

            // Extract brand logo from populated brandId or company
            let brandLogo = item.brandId?.brandLogo || null;

            if (item.status === "FAKE" || item.status === "INACTIVE") {
              type = "Counterfeit";
              statusLabel = "Counterfeit";
              statusText = "This product is identified as counterfeit. Please be cautious.";
              badgeColor = "text-[#EF4444]";
              badgeBorder = "border-[#EF4444]/30";
              badgeBg = "bg-[#FEF2F2]";
              statusIcon = "counterfeit";
              ribbonColor = "#EF4444";
            } else if (item.status === "ALREADY_USED" || item.status === "DUPLICATE") {
              type = "Duplicate";
              statusLabel = "Duplicate";
              statusText = "This product has been scanned before";
              badgeColor = "text-[#F59E0B]";
              badgeBorder = "border-[#F59E0B]/30";
              badgeBg = "bg-[#FFFBEB]";
              statusIcon = "alert";
              ribbonColor = "#F59E0B";
            }

            const prod = item.productId || {};
            const category = prod.category || item.category || "Product";
            const brandName = item.brandId?.brandName || item.brandName || "";
            const productName = item.productName || prod.productName || "Unknown Product";

            // Format title to match design "Brand Model"
            const cardTitle = brandName ? (productName.toLowerCase().includes(brandName.toLowerCase()) ? productName : `${brandName} ${productName}`) : productName;

            return {
              id: item._id,
              type,
              cardTitle,
              productName,
              brandName,
              category,
              sn: item.qrCode || "Unknown",
              scannedDate: `${day} ${monthName} ${year}`,
              scannedTime: timeStr,
              brandLogo,
              statusLabel,
              statusText,
              badgeColor,
              badgeBorder,
              badgeBg,
              statusIcon,
              ribbonColor,
              fullData: item,
              status: item.status
            };
          });
          cachedHistory = mappedData;
          lastHistoryFetchTime = Date.now();
          setHistoryItems(mappedData);
        }
      } catch (err) {
        console.error("Error fetching scan history:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredItems = historyItems.filter(item => {
    // Filter by tab
    if (activeTab !== "All Scans" && item.type !== activeTab) {
      return false;
    }
    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.cardTitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.sn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const dateA = new Date(a.fullData?.createdAt || 0);
    const dateB = new Date(b.fullData?.createdAt || 0);
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const getTabCount = (tabName) => {
    if (tabName === "All Scans") return historyItems.length;
    return historyItems.filter(item => item.type === tabName).length;
  };

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const currentItems = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const tabs = [
    { name: "All Scans", icon: ScanLine, activeBg: "bg-[#105DE4]", activeText: "text-white", inactiveText: "text-[#64748B]" },
    { name: "Verified", icon: ShieldCheck, activeBg: "bg-[#10B981]", activeText: "text-white", inactiveText: "text-[#64748B]" },
    { name: "Duplicate", icon: AlertTriangle, activeBg: "bg-[#F59E0B]", activeText: "text-white", inactiveText: "text-[#64748B]" },
    { name: "Counterfeit", icon: XCircle, activeBg: "bg-[#EF4444]", activeText: "text-white", inactiveText: "text-[#64748B]" },
  ];

  const Card = ({ item }) => {
    return (
      <div
        onClick={() => {
          const status = item.status || 'ORIGINAL';
          if (status === 'ORIGINAL') {
            navigate('/product-passport', { state: item.fullData });
          } else {
            navigate(`/result/${status}`, { state: item.fullData });
          }
        }}
        className="bg-white rounded-[20px] flex overflow-hidden cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#F1F5F9] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 active:scale-[0.98] mb-3"
      >
        {/* Left Ribbon */}
        <div 
          className="w-[5px] flex-shrink-0 rounded-l-[20px]" 
          style={{ backgroundColor: item.ribbonColor }}
        />

        <div className="flex items-center gap-3 p-3.5 flex-1 min-w-0">
          {/* Brand Logo Container */}
          <div className="w-[52px] h-[52px] rounded-[12px] border border-[#F1F5F9] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm p-1.5"
            style={{ backgroundColor: item.brandLogo ? '#FFFFFF' : item.ribbonColor + '15' }}
          >
            {item.brandLogo ? (
              <img src={item.brandLogo} alt={item.cardTitle} className="w-full h-full object-contain" />
            ) : (
              <span className="text-[18px] font-black" style={{ color: item.ribbonColor }}>
                {(item.brandName || item.productName || 'P').charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-[15px] text-[#0F172A] leading-tight truncate">
              {item.productName}
            </h4>
            <p className="text-[12px] text-[#64748B] truncate mt-0.5 font-medium">{item.brandName || "Unknown Brand"}</p>
            <div className="flex items-center gap-1.5 text-[#94A3B8] text-[11px] font-semibold mt-1.5">
              <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{item.scannedDate}, {item.scannedTime}</span>
            </div>
          </div>

          {/* Chevron */}
          <ChevronRight className="w-5 h-5 text-[#CBD5E1] flex-shrink-0" strokeWidth={2.5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-[100px] flex flex-col relative overflow-hidden">
      {/* Header Area */}
      <div className="bg-white px-5 pt-4 pb-2 sticky top-0 z-40 border-b border-[#F1F5F9] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-6 h-6 text-[#0F172A]" strokeWidth={2.5} />
          </button>
          <h1 className="text-[18px] font-extrabold text-[#0F172A] tracking-tight">Scan History</h1>
          <button
            onClick={() => {
              setSortOrder(prev => prev === "newest" ? "oldest" : "newest");
              setCurrentPage(1);
            }}
            className={`p-2 -mr-2 rounded-full transition-colors relative ${sortOrder === 'oldest' ? 'bg-[#EEF2FF]' : 'hover:bg-slate-50'}`}
          >
            <Filter className={`w-5 h-5 ${sortOrder === 'oldest' ? 'text-[#105DE4]' : 'text-[#0F172A]'}`} strokeWidth={2} />
            {sortOrder === 'oldest' && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#105DE4] rounded-full border border-white"></span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-[18px] w-[18px] text-[#94A3B8]" strokeWidth={2.5} />
          </div>
          <input
            type="text"
            className="w-full bg-[#F1F5F9] border border-transparent rounded-[14px] py-3 pl-11 pr-4 text-[14px] font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:bg-white focus:border-[#105DE4] focus:ring-4 focus:ring-[#105DE4]/10 transition-all outline-none"
            placeholder="Search by product or brand"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 overflow-x-auto hide-scroll -mx-5 px-5 pt-1 pb-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            const Icon = tab.icon;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 flex-shrink-0 px-4 py-2.5 rounded-[14px] transition-all duration-300 ${isActive ? `${tab.activeBg} shadow-[0_4px_12px_rgba(0,0,0,0.1)]` : 'bg-[#F1F5F9] hover:bg-[#E2E8F0]'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? tab.activeText : tab.inactiveText}`} strokeWidth={2.5} />
                <span className={`text-[13px] font-bold tracking-tight ${isActive ? tab.activeText : tab.inactiveText}`}>
                  {tab.name}
                </span>
                <span className={`text-[12px] font-extrabold px-2 py-0.5 rounded-[8px] ml-1 transition-colors ${isActive ? 'bg-black/15 text-white' : 'bg-white text-[#64748B] shadow-sm'
                  }`}>
                  {getTabCount(tab.name)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* List Content */}
      <div className="px-5 pt-5 pb-6 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full pt-20">
            <div className="w-8 h-8 border-4 border-[#105DE4] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-300" strokeWidth={2} />
            </div>
            <h3 className="text-slate-800 font-bold text-[16px] mb-1">No scans found</h3>
            <p className="text-slate-500 font-medium text-[13px]">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <>
            {currentItems.map(item => <Card key={item.id} item={item} />)}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 mb-4 px-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-[10px] text-[13px] font-bold transition-colors ${currentPage === 1 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
                >
                  Previous
                </button>
                <span className="text-[13px] font-semibold text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-[10px] text-[13px] font-bold transition-colors ${currentPage === totalPages ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#105DE4] text-white hover:bg-blue-700 shadow-[0_4px_12px_rgba(16,93,228,0.25)]'}`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <MobileNavbar />

      {/* Styles */}
      <style>
        {`
          .hide-scroll::-webkit-scrollbar {
            display: none;
          }
          .hide-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
    </div>
  );
}
