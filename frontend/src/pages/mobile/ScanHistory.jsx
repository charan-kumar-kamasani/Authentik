import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";
import Logo from "../../assets/Authentiks.png";
import NotificationIcon from "../../assets/icon_notification.png";
import StatusValid from "../../assets/recent_status_valid.png";
import StatusFake from "../../assets/recent_status_fake.png";
import StatusDuplicate from "../../assets/recent_status_duplicate.png";

export default function ScanHistory() {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
          const mappedData = data.map((item) => {
            const dateObj = new Date(item.createdAt);
            const dateStr = dateObj.toLocaleDateString("en-GB"); // DD/MM/YYYY
            const timeStr = dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            let type = "valid";
            let icon = StatusValid;
            let content = {};

            if (item.status === "FAKE") {
              type = "fake";
              icon = StatusFake;
              content = {
                title: "Fake or Counterfeit",
                subtitle: "This product doesn't match our authenticity records",
              };
            } else if (item.status === "ALREADY_USED") {
              type = "duplicate";
              icon = StatusDuplicate;
              // Show product details and, if available, original scan info
              const prod = item.productId || {};
              content = {
                brand: prod.brand || '-',
                product: item.productName || prod.productName || 'Product',
                batchNo: item.batchNo || prod.batchNo || '-',
                mfdOn: prod.manufactureDate || item.manufactureDate || '-',
                expOn: prod.expiryDate || item.expiryDate || '-',
                originalScan: item.originalScan || null,
              };
            } else {
              // ORIGINAL
              type = "valid";
              icon = StatusValid;
              const prod = item.productId || {};
              content = {
                brand: prod.brand || "N/A",
                product: item.productName || prod.productName || "Product",
                netQty: prod.quantity ? `${prod.quantity}` : "-",
                mfdOn: prod.manufactureDate || "-",
              };
            }

            return {
              id: item._id,
              type,
              content,
              scannedDate: dateStr,
              scannedTime: timeStr,
              icon,
            };
          });
          setHistoryItems(mappedData);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const Card = ({ item }) => {
    return (
      <div className="w-full mb-4 shadow-md rounded-[20px] overflow-hidden font-sans">
        {/* Top Section - Blue */}
        <div className="bg-white p-4 flex items-center min-h-[120px]">
          <div className="w-[80px] h-[80px] flex-shrink-0 mr-4 flex items-center justify-center">
             {/* Using the assets from Home, assuming they work well on this background or need a container */}
             <img src={item.icon} alt={item.type} className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            {item.type === "valid" ? (
              <div className="text-[15px] font-medium leading-snug">
                <p><span className="font-bold">Brand:</span> {item.content.brand}</p>
                <p><span className="font-bold">Product:</span> {item.content.product}</p>
                {/* <p><span className="font-bold">Net Qty:</span> {item.content.netQty}</p> */}
                <p><span className="font-bold">Mfd On:</span> {item.content.mfdOn}</p>
              </div>
            ) : (
              <div>
                {/* For duplicate scans show product details and original scan info if present */}
                <div className="text-[15px] font-medium leading-snug">
                  <p><span className="font-bold">Brand:</span> {item.content.brand}</p>
                  <p><span className="font-bold">Product:</span> {item.content.product}</p>
                  <p><span className="font-bold">Batch:</span> {item.content.batchNo}</p>
                  <p><span className="font-bold">Mfd On:</span> {item.content.mfdOn}</p>
                  <p><span className="font-bold">Exp On:</span> {item.content.expOn}</p>
                </div>
                {/* {item.content.originalScan && (
                  <div className="mt-2 text-[13px] leading-tight opacity-90">
                    <p><span className="font-bold">Original Scan By:</span> {item.content.originalScan.scannedBy}</p>
                    <p><span className="font-bold">Original Scanned At:</span> {new Date(item.content.originalScan.scannedAt).toLocaleString()}</p>
                    <p><span className="font-bold">Place:</span> {item.content.originalScan.place || '-'}</p>
                  </div>
                )} */}
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Section - White */}
        <div className="bg-[#2B9AC5] py-2 px-4 flex justify-center items-center">
            <p className="text-[#214B80] text-[13px] font-semibold">
                Scanned on: {item.scannedDate} <span className="ml-4">Time: {item.scannedTime}</span>
            </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F4F8] to-[#0F4160] font-sans flex flex-col items-center pb-10">
      {/* Header */}
      <div className="w-full flex items-center justify-between p-4 pt-6">
        <button onClick={() => navigate(-1)} className="p-2">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F4160" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
            </svg>
        </button>
        <h1
          className="text-[24px] font-bold tracking-tight text-[#214B80]"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
        >
          Authen<span className="text-[#2CA4D6]">tiks</span>
        </h1>
        <button className="p-2">
           <img src={NotificationIcon} alt="Notifications" className="w-6 h-6" />
        </button>
      </div>

      <div className="w-full max-w-md px-5 flex-1 pb-10">
        <h1 className="text-[#0F4160] text-[22px] font-bold mb-6">Scan History</h1>
        
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Loading history...</p>
        ) : historyItems.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No scan history found.</p>
        ) : (
          historyItems.map((item) => <Card key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
