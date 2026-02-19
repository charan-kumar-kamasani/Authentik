import React from "react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import techBg from "../../assets/web/hero_image.png";

// Assets for "What's Included"
import verifiedIcon from "../../assets/web/pricing/verified.svg";
import recheckIcon from "../../assets/web/pricing/recheck.svg";
import counterfeitIcon from "../../assets/web/pricing/countefeit.svg";
import couponIcon from "../../assets/web/pricing/coupon.svg";

// Badge Assets
import scale6 from "../../assets/web/pricing/scale_6.png"; // Most Popular
import scale4 from "../../assets/web/pricing/scale_4.png"; // Save 50k
import scal3 from "../../assets/web/pricing/scal_3.png"; // Save 3L

const SectionSeparator = () => (
    <div className="h-[3px] bg-gray-200 flex-grow"></div>
);

export default function WebPricing() {
    return (
        <div className="font-sans min-h-screen bg-white w-full overflow-x-hidden">
            <WebHeader />

            {/* Hero Banner */}
            <div
                className="w-full h-[200px] flex items-center relative overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: `url(${techBg})` }}
            >
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="container mx-auto px-6 md:px-12 relative z-10 text-white">
                    <h1 className="text-4xl font-bold mb-2">Pricing</h1>
                    <p className="text-xl text-blue-200">
                        Turn every scan into trust today and repeat purchases tomorrow.
                    </p>
                </div>
            </div>

            {/* Pricing Plans */}
            <section className="py-12 bg-white w-full px-8 md:px-16">
                <div className="flex items-center justify-center mb-4 relative w-full px-4 gap-4">
                    <SectionSeparator />
                    <h2 className="text-2xl md:text-4xl font-bold text-[#214B80] text-center whitespace-nowrap">Pricing Plans</h2>
                    <SectionSeparator />
                </div>
                <p className="text-center text-[#214B80] font-semibold text-base md:text-lg mb-4">
                    Enterprise-grade product authentication. Zero platform fee.
                </p>
                <p className="text-center text-[#214B80] font-bold italic text-base md:text-lg mb-14">
                    "Don't Just Sell Products. Own the Data Behind Them, Subscribe Now."
                </p>

                {/* Overlapping Cards Layout - Desktop */}
                <div className="hidden md:flex items-end justify-center relative max-w-5xl mx-auto gap-6" style={{ minHeight: '520px' }}>
                    {/* Starter Plan - Left */}
                    <div className="relative z-15 -mr-4 mb-0 self-end">
                        <img
                            src={scale6}
                            alt="Starter Plan"
                            className="w-[300px] h-auto object-contain drop-shadow-lg rounded-4xl mb-4"
                        />
                    </div>

                    {/* Growth Plan - Center, Elevated */}
                    <div className="relative z-20 flex flex-col items-center -mt-8">
                        {/* Most Popular Badge */}
                        <div className="bg-[#1A9DD4] text-white font-bold text-lg px-16 py-2 rounded-t-[20px] shadow-md whitespace-nowrap">
                            Most Popular
                        </div>
                        <img
                            src={scale4}
                            alt="Growth Plan"
                            className="w-[320px] h-auto object-contain drop-shadow-xl rounded-4xl"
                        />
                    </div>

                    {/* Scale Plan - Right */}
                    <div className="relative z-10 -ml-4 mb-0 self-end">
                        <img
                            src={scal3}
                            alt="Scale Plan"
                            className="w-[310px] h-auto object-contain drop-shadow-lg rounded-4xl mb-4"
                        />
                    </div>
                </div>

                {/* Mobile Cards Layout - Stacked */}
                <div className="flex md:hidden flex-col items-center gap-8">
                    {/* Starter */}
                    <div>
                        <img
                            src={scale6}
                            alt="Starter Plan"
                            className="w-[300px] h-auto object-contain drop-shadow-lg rounded-2xl"
                        />
                    </div>

                    {/* Growth - with badge */}
                    <div className="flex flex-col items-center">
                        <div className="bg-[#214B80] text-white font-bold text-lg px-8 py-2 rounded-full mb-3 shadow-md">
                            Most Popular
                        </div>
                        <img
                            src={scale4}
                            alt="Growth Plan"
                            className="w-[320px] h-auto object-contain drop-shadow-xl rounded-2xl"
                        />
                    </div>

                    {/* Scale */}
                    <div>
                        <img
                            src={scal3}
                            alt="Scale Plan"
                            className="w-[300px] h-auto object-contain drop-shadow-lg rounded-2xl"
                        />
                    </div>
                </div>



                <p className="text-center mt-10 text-lg md:text-xl font-bold italic text-[#333]">
                    "Just 1 prevented counterfeit case can save ₹10-50 lakhs."
                </p>
            </section>

            {/* What's Included */}
            <section className="py-12 bg-white w-full px-8 md:px-16">
                <div className="flex items-center justify-center mb-10 relative w-full px-4 gap-4">
                    <SectionSeparator />
                    <h2 className="text-2xl md:text-4xl font-bold text-[#214B80] text-center whitespace-nowrap">What's Included</h2>
                    <SectionSeparator />
                </div>

                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                    <FeatureCard icon={verifiedIcon} title="Unique QR Generation & Printing" />
                    <FeatureCard icon={recheckIcon} title="Scan Verification & Analysis" />
                    <FeatureCard icon={counterfeitIcon} title="Track Down Fake & Counterfeit Goods" />
                    <FeatureCard icon={couponIcon} title="Optional Coupons & Engagement" />
                </div>
            </section>

            {/* Why Brands Trust Authentiks */}
            <section className="py-12 bg-white w-full px-8 md:px-16">
                <div className="flex items-center justify-center mb-10 relative w-full px-4 gap-4">
                    <SectionSeparator />
                    <h2 className="text-2xl md:text-4xl font-bold text-[#214B80] text-center whitespace-nowrap">Why Brands Trust Authentiks</h2>
                    <SectionSeparator />
                </div>

                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TrustCard
                        title="Protection Against Counterfeits"
                        items={["Verify every product in real time", "Detect fake or duplicate products instantly", "Identify grey-market and parallel sales"]}
                    />
                    <TrustCard
                        title="Visibility After the Sale"
                        items={["Know where your products are scanned", "Know when and how often they are scanned", "Spot unusual scan patterns early"]}
                    />
                    <TrustCard
                        title="Actionable Market Intelligence"
                        items={["City-wise and region-wise demand signals", "Identify high-risk counterfeit zones", "Track genuine customer interactions"]}
                    />
                    <TrustCard
                        title="Increased Repeat Purchases"
                        items={["Offer coupons or discounts after genuine scan", "Encourage customers to buy again", "Convert one-time buyers into loyal customers"]}
                    />
                    <TrustCard
                        title="Stronger Customer Trust"
                        items={["Customers can instantly verify authenticity", "Builds confidence in buying genuine products", "Reduces customer complaints & disputes"]}
                    />
                    <TrustCard
                        title="Easy to Adopt & Scale"
                        items={["No subscription during trial", "Pay only for QR codes", "Works for small and large brands alike"]}
                    />
                    <TrustCard
                        title="Simple Product-Level Authentication"
                        items={["One QR per product unit", "Unique identity for every item", "No complex hardware or changes to production"]}
                    />
                    <TrustCard
                        title="Warning System for Brand Abuse"
                        items={["Duplicate scan alerts", "Unusual scanning behaviour detection", "Region-based counterfeit signals"]}
                    />
                    <TrustCard
                        title="Cost-Effective Brand Security"
                        items={["Much cheaper than legal action", "Scales with production volume", "ROI visible within weeks"]}
                    />
                    <TrustCard
                        title="Works Across Channels"
                        items={["Online marketplaces", "Retail stores", "Distributors & resellers"]}
                    />
                </div>
            </section>

            <WebFooter />
        </div>
    );
}

function FeatureCard({ icon, title }) {
    return (
        <div className="border-2 border-gray-200 rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 mb-3 flex items-center justify-center">
                <img src={icon} alt={title} className="w-full h-full object-contain" />
            </div>
            <p className="text-[#214B80] font-bold text-sm leading-tight">{title}</p>
        </div>
    );
}

function TrustCard({ title, items }) {
    return (
        <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#214B80] via-[#10233f] to-[#070F1A]
 text-white text-center py-2.5 px-4">
                <h4 className="text-base font-bold italic">{title}</h4>
            </div>
            <div className="p-4">
                <ul className="">
                    {items.map((item, idx) => (
                        <li key={idx} className="flex items-start text-[#214B80] font-semibold text-[16px]">
                            <span className="text-[#214B80] font-bold">•</span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
