import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { unifiedPricingData } from '../data/pricingData';
import AnimatedCTA from './AnimatedCTA';

export default function PricingCards({ onCTA }) {
    // Generate the cards data from unifiedPricingData
    const cardsData = unifiedPricingData.plans.map(plan => {
        // Find which feature sections to include for this plan
        const includedSections = [];
        
        // Handle "Includes" / "Includes everything in X +" section
        let firstSectionItems = [];
        let firstSectionTitle = plan.includedPrefix ? plan.includedPrefix.toUpperCase() : 'INCLUDES:';

        unifiedPricingData.categories.forEach((cat, catIdx) => {
            const features = cat.features.filter(f => f[plan.id] && f.inCard !== false);
            if (features.length > 0) {
                if (cat.cardDisplayPlan && cat.cardDisplayPlan !== plan.id) return;
                
                let relevantFeatures = features;
                if (plan.id === 'growth') {
                    relevantFeatures = features.filter(f => !f.starter);
                } else if (plan.id === 'enterprise') {
                    relevantFeatures = features.filter(f => !f.growth);
                }

                if (relevantFeatures.length > 0) {
                    // For the first couple of categories (Authentication, Dashboard), we merge them into the top INCLUDES section in Starter.
                    // Actually, let's look at the image.
                    // Image for Starter: INCLUDES: Unique QR..., First-scan..., Basic scan..., Dashboard access
                    // Image for Growth: INCLUDES EVERYTHING IN STARTER + : Coupon & rewards..., Customer data..., Redirect..., Counterfeit alerts..., Advanced scan analytics
                    // Image for Enterprise: INCLUDES EVERYTHING IN GROWTH + : Real-time counterfeit alerts..., Advanced analytics..., Batch-level tracking..., API integrations..., Priority support
                    
                    // So we can merge the first category's items into `firstSectionItems` if they belong there.
                    // Let's just create separate sections for all of them, but maybe the first one or two categories don't have a title in the design?
                    // Actually, looking at the image:
                    // Growth has "AI PULSE INSIGHTS" and "SMART DATA ACCESS".
                    // Enterprise has "ADVANCED AI PULSE".
                    // Starter has "PRIVACY-FIRST ANALYTICS".
                    
                    // Let's look at unifiedPricingData categories:
                    // 0: Authentication
                    // 1: Dashboard & Insights
                    // 2: Customer Intelligence
                    // 3: Anti-Counterfeit Intelligence
                    // 4: Warranty Management
                    // 5: Engagement & Growth
                    // 6: Advanced Insights
                    // 7: Integrations & Automation
                    
                    // If we just use the titles, it works, but we want the top section to be titled "INCLUDES" or "INCLUDES EVERYTHING IN X +".
                    // We can put Authentication, Dashboard, Customer Intelligence (some), Engagement (some) into the first section if we want it to perfectly match.
                    // To keep it simple and dynamic: we will treat the FIRST relevant category or categories that don't have an explicit icon/special treatment as the "INCLUDES" block.
                    // Actually, the simplest way is to just render the section title unless it's empty.
                    // Let's explicitly define in unifiedPricingData which categories go into the "Main Includes" block.
                    // For now, let's just group them into `firstSectionItems` if catIdx <= 1 (for Starter) or just let the unified data flow.
                    // Let's stick to the structured data from unifiedPricingData, but we'll use `plan.includedPrefix` as the first section title.
                    // Let's just output the categories as they are.
                    
                    includedSections.push({
                        title: cat.name.toUpperCase(),
                        items: relevantFeatures.map(f => f.name)
                    });
                }
            }
        });

        // Pull the first section to act as the main "INCLUDES" section if needed, or we can just let them all be separate sections.
        // In the image, the first block of features has the title "INCLUDES:". The next blocks have a small icon next to the title.
        // Let's separate the first section from the rest.
        let mainIncludesTitle = plan.includedPrefix ? plan.includedPrefix.toUpperCase() : 'INCLUDES:';
        let mainIncludesItems = [];
        let otherSections = [];

        if (includedSections.length > 0) {
            mainIncludesItems = includedSections[0].items;
            otherSections = includedSections.slice(1);
        }

        // Add `notIncludedCategories` for Starter if needed. But wait, in the new image, there is NO "Not Included" section!
        // So we can omit it if it's not in the image.

        // Derive UI properties
        let tagColor = plan.accentColor; // e.g. text-green-400
        let baseColor = tagColor.split('-')[1]; // e.g. green
        let tagBg = `bg-${baseColor}-500/10 ${tagColor}`;
        if (plan.id === 'growth') {
            baseColor = 'blue';
            tagBg = `bg-blue-500/10 text-blue-400`;
        }

        return {
            id: plan.id,
            tier: plan.name,
            tag: plan.bestFor,
            badge: plan.isPopular ? '⭐ MOST POPULAR' : null,
            borderColor: plan.borderColor,
            tagBg: tagBg,
            saveColor: plan.accentColor, // Color for the checkboxes
            highlighted: plan.isPopular,
            mainIncludesTitle: mainIncludesTitle,
            mainIncludesItems: mainIncludesItems,
            otherSections: otherSections
        };
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cardsData.map((plan, i) => (
                <div
                    key={i}
                    className={`group glass-effect rounded-[2.5rem] p-8 md:p-10 border ${plan.borderColor} transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden flex flex-col ${plan.highlighted ? 'ring-1 ring-blue-500/40 bg-blue-500/5' : ''}`}
                >
                    {plan.badge && (
                        <div className="absolute top-0 right-0 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">
                            {plan.badge}
                        </div>
                    )}
                    
                    <div className={`inline-flex px-4 py-1.5 rounded-full text-[12px] font-black uppercase tracking-widest ${plan.tagBg} mb-6 w-fit`}>
                        {plan.tier}
                    </div>

                    <p className="text-sm text-gray-400 font-bold mb-8 leading-relaxed italic">{plan.tag}</p>

                    <div className="space-y-8 mb-10 flex-grow">
                        {/* Main Includes Section */}
                        {plan.mainIncludesItems.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 opacity-80">{plan.mainIncludesTitle}</h4>
                                <ul className="space-y-3">
                                    {plan.mainIncludesItems.map((item, k) => (
                                        <li key={k} className="flex items-start gap-3">
                                            <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${plan.saveColor}`} />
                                            <span className="text-gray-300 font-bold text-sm leading-tight">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Other Sections */}
                        {plan.otherSections.map((section, j) => (
                            <div key={j}>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 opacity-80 flex items-center gap-2">
                                    {/* Using a generic icon or just text, the image uses an emoji or small icon. We'll stick to text for now */}
                                    {section.title}
                                </h4>
                                <ul className="space-y-3">
                                    {section.items.map((item, k) => (
                                        <li key={k} className="flex items-start gap-3">
                                            <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${plan.saveColor}`} />
                                            <span className="text-gray-300 font-bold text-sm leading-tight">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <AnimatedCTA 
                        onClick={onCTA}
                        className="w-full"
                    />
                </div>
            ))}
        </div>
    );
}
