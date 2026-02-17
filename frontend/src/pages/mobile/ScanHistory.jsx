import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";
import MobileHeader from "../../components/MobileHeader";

// Assets
import StatusValid from "../../assets/logo.svg";
import StatusFake from "../../assets/v2/history/dangerous.svg";
import StatusDuplicate from "../../assets/v2/history/warning.svg";

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
          // Map data
          const mappedData = data.map((item) => {
            const dateObj = new Date(item.createdAt);
            const dateStr = dateObj.toLocaleDateString("en-GB");
            const timeStr = dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            }).toLowerCase(); // "10:10 am"

            let type = "valid";
            let icon = StatusValid;
            let content = {};

            if (item.status === "FAKE") {
              type = "fake";
              // "dangerous" icon (red circle x)
              icon = StatusFake;
              content = {
                title: "Fake or Counterfeit",
                subtitle: "This product doesn't match our authenticity records",
              };
            } else if (item.status === "ALREADY_USED" || item.status === "DUPLICATE") {
              type = "duplicate";
              // "warning" icon (yellow triangle)
              icon = StatusDuplicate;
              content = {
                title: "Duplicate Scan",
                subtitle: "This QR code has been scanned before. Please check product details carefully."
              };
            } else {
              // Valid
              type = "valid";
              icon = StatusValid;
              const prod = item.productId || {};
              content = {
                brand: prod.brand || item.productName || "Amul",
                product: item.productName || prod.productName || "Amul Pure Ghee",
                mfdOn: prod.manufactureDate || "10/24",
                expOn: prod.expiryDate || "10/25",
              };
            }

            return {
              id: item._id,
              type,
              content,
              scannedDate: dateStr,
              scannedTime: timeStr,
              icon,
              latitude: item.latitude,
              longitude: item.longitude,
              place: item.place,
            };
          });
          setHistoryItems(mappedData);
        }
      } catch (err) {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const Card = ({ item }) => {
    // Top section background color? No, screenshot shows all have white top, blue bottom.
    // Except valid card icon is blue shield, fake is red hexagon, duplicate is yellow triangle.

    return (
      <div className="w-full mb-4 bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100 flex flex-col">
        {/* Main Content */}
        <div className="flex items-center p-4 min-h-[110px]">
          {/* Icon Container */}
          <div className="w-[80px] h-[80px] flex-shrink-0 mr-4 flex items-center justify-center">
            <img src={item.icon} alt={item.type} className="w-full h-full object-contain" />
          </div>

          {/* Text Container */}
          <div className="flex-1">
            {item.type === 'valid' ? (
              <div className="text-[14px] leading-snug">
                <p className="font-bold text-[#0D4E96]">Brand: <span className="font-bold text-[#0D4E96]">{item.content.brand}</span></p>
                <p className="font-bold text-[#0D4E96]">Product: <span className="font-bold text-[#0D4E96]">{item.content.product}</span></p>
                <p className="font-bold text-[#0D4E96]">Mfd On: <span className="font-bold text-[#0D4E96]">{item.content.mfdOn}</span></p>
                <p className="font-bold text-[#0D4E96]">Exp On: <span className="font-bold text-[#0D4E96]">{item.content.expOn}</span></p>
              </div>
            ) : (
              <div>
                <h3 className={`font-bold text-[18px] mb-1 ${item.type === 'fake' ? 'text-[#E30211]' : 'text-[#0D4E96]'}`}>
                  {item.content.title}
                </h3>
                <p className="text-[#0D4E96] text-[13px] font-bold leading-tight">
                  {item.content.subtitle}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Blue Bar with Location */}
        <div className="bg-[#0E5CAB] text-white py-2 px-4 text-[12px] font-bold">
          <div className="text-center mb-2">Scanned on: {item.scannedDate} <span className="ml-2">Time: {item.scannedTime}</span></div>
          {/* {item.latitude && item.longitude && (
            <div className="text-center text-[11px] font-normal border-t border-blue-400 pt-2">
              📍 Location: {parseFloat(item.latitude).toFixed(4)}, {parseFloat(item.longitude).toFixed(4)}
              {item.place && <div className="text-[10px] mt-1">{item.place}</div>}
            </div>
          )} */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col pb-10">
      {/* Header */}
      {/* Header */}
      <MobileHeader onLeftClick={() => navigate(-1)} />

      <div className="px-5 flex-1">
        <h2 className="text-[#2CA4D6] text-[18px] font-bold mb-4 mt-2">Scan History</h2>

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
