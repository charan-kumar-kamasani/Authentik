export const unifiedPricingData = {
    plans: [
        {
            id: 'starter',
            name: 'STARTER',
            subtitle: 'Secure Your Products',
            bestFor: 'Brands starting with anti-counterfeit protection',
            color: 'from-green-500 to-emerald-400',
            borderColor: 'border-green-500/20 hover:border-green-500/40',
            accentColor: 'text-green-400',
            bgGlow: 'bg-green-500/20',
            shadowColor: 'shadow-green-500/10',
            headerStyle: 'bg-green-500/10 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.15)]',
            notIncludedCategories: ['Warranty system', 'Customer data capture', 'Campaigns & engagement', 'Advanced analytics']
        },
        {
            id: 'growth',
            name: 'GROWTH',
            subtitle: 'Turn Every Product into a Customer Channel',
            isPopular: true,
            bestFor: 'Brands looking to build customer relationships and drive repeat sales',
            color: 'from-blue-600 to-indigo-400',
            borderColor: 'border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20 hover:border-blue-500/50',
            accentColor: 'text-blue-400',
            bgGlow: 'bg-blue-500/20',
            shadowColor: 'shadow-blue-500/20',
            headerStyle: 'bg-blue-500/10 border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]',
            includedPrefix: 'Everything in Starter, plus:'
        },
        {
            id: 'enterprise',
            name: 'ENTERPRISE',
            subtitle: 'Full Product Intelligence & Automation',
            bestFor: 'Large brands scaling operations, analytics, and automation',
            color: 'from-purple-600 to-fuchsia-400',
            borderColor: 'border-purple-500/20 hover:border-purple-500/40',
            accentColor: 'text-purple-400',
            bgGlow: 'bg-purple-500/20',
            shadowColor: 'shadow-purple-500/10',
            headerStyle: 'bg-purple-500/10 border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]',
            includedPrefix: 'Everything in Growth, plus:'
        }
    ],
    categories: [
        {
            name: 'Authentication',
            features: [
                { name: 'Unique QR for every product', labelInTable: 'Unique QR per product', starter: true, growth: true, enterprise: true, inCard: true },
                { name: 'Instant product verification (Genuine / Fake)', labelInTable: 'Real-time verification', starter: true, growth: true, enterprise: true, inCard: true },
                { name: 'First scan authentication', labelInTable: 'First scan authentication', starter: true, growth: true, enterprise: true, inCard: true },
                { name: 'Duplicate scan detection', labelInTable: 'Duplicate detection', starter: true, growth: true, enterprise: true, inCard: true }
            ]
        },
        {
            name: 'Dashboard & Insights',
            cardDisplayPlan: 'starter',
            features: [
                { name: 'Centralized dashboard', starter: true, growth: true, enterprise: true, inCard: true, inTable: false },
                { name: 'Total scan tracking', starter: true, growth: true, enterprise: true, inCard: true, inTable: false },
                { name: 'Product-level visibility', starter: true, growth: true, enterprise: true, inCard: true, inTable: false }
            ]
        },
        {
            name: 'Customer Intelligence',
            features: [
                { name: 'Capture customer phone numbers with consent', labelInTable: 'Consent-based phone capture', starter: false, growth: true, enterprise: true, inCard: true },
                { name: 'Collect basic details (name, age group, gender)', labelInTable: 'Customer profile (name, age, gender)', starter: false, growth: true, enterprise: true, inCard: true },
                { name: 'Build a verified customer database', labelInTable: 'Customer-level tracking', starter: false, growth: true, enterprise: true, inCard: true },
                { name: 'Customer segmentation', labelInTable: 'Customer segmentation', starter: false, growth: false, enterprise: true, inCard: true, inTable: false },
                { name: 'Exportable customer database', labelInTable: 'Export customer database', starter: false, growth: false, enterprise: true, inCard: true },
                { name: 'Behavioral insights', labelInTable: 'Behavioral insights', starter: false, growth: false, enterprise: true, inCard: true, inTable: false }
            ]
        },
        {
            name: 'Anti-Counterfeit Intelligence',
            features: [
                { name: 'Geo-location tracking of scans', labelInTable: 'Geo-location tracking', starter: false, growth: true, enterprise: true, inCard: true },
                { name: 'Duplicate scan detection with location', labelInTable: 'Duplicate scan location tracking', starter: false, growth: true, enterprise: true, inCard: true },
                { name: 'Customer-reported counterfeit alerts', labelInTable: 'Customer counterfeit reporting', starter: false, growth: true, enterprise: true, inCard: true },
                { name: 'Image upload for fake reports', labelInTable: 'Image upload for fake reports', starter: false, growth: true, enterprise: true, inCard: false },
                { name: 'Counterfeit hotspot detection', labelInTable: 'Counterfeit hotspot insights', starter: false, growth: false, enterprise: true, inCard: true },
                { name: 'Advanced reporting dashboard', labelInTable: 'Advanced reporting dashboard', starter: false, growth: false, enterprise: true, inCard: true, inTable: false },
                { name: 'Market-level intelligence insights', labelInTable: 'Market-level intelligence insights', starter: false, growth: false, enterprise: true, inCard: true, inTable: false }
            ]
        },
        {
            name: 'Warranty Management',
            labelInTable: 'Warranty & Service',
            features: [
                { name: 'Digital warranty activation', labelInTable: 'Warranty activation', starter: false, growth: true, enterprise: true, inCard: true },
                { name: 'Warranty claim requests', labelInTable: 'Warranty claims management', starter: false, growth: true, enterprise: true, inCard: true },
                { name: 'Customer service tracking', labelInTable: 'Customer service tracking', starter: false, growth: true, enterprise: true, inCard: true, inTable: false },
                { name: 'Advanced warranty workflows', labelInTable: 'Advanced warranty workflows', starter: false, growth: false, enterprise: true, inCard: false }
            ]
        },
        {
            name: 'Engagement & Growth',
            features: [
                { name: 'Coupon campaigns', labelInTable: 'Coupons / offers', starter: false, growth: true, enterprise: true, inCard: true },
                { name: 'Feedback collection', labelInTable: 'Feedback collection', starter: false, growth: true, enterprise: true, inCard: true },
                { name: 'Customer interaction via scan', labelInTable: 'Customer interaction via scan', starter: false, growth: true, enterprise: true, inCard: true, inTable: false },
                { name: 'Multi-offer campaigns', labelInTable: 'Advanced campaigns', starter: false, growth: false, enterprise: true, inCard: true },
                { name: 'Repeat purchase triggers', labelInTable: 'Conditional campaigns', starter: false, growth: false, enterprise: true, inCard: true }
            ]
        },
        {
            name: 'Advanced Insights',
            labelInTable: 'Analytics & Insights',
            features: [
                { name: 'Basic analytics', labelInTable: 'Basic analytics', starter: true, growth: true, enterprise: true, inCard: false },
                { name: 'Customer-level analytics', labelInTable: 'Customer insights', starter: false, growth: true, enterprise: true, inCard: true },
                { name: 'Location-based insights', labelInTable: 'Location-based insights', starter: false, growth: true, enterprise: true, inCard: true },
                { name: 'Custom reports', labelInTable: 'Custom reports', starter: false, growth: false, enterprise: true, inCard: true, inTable: false },
                { name: 'Data-driven insights', labelInTable: 'Data-driven insights', starter: false, growth: false, enterprise: true, inCard: true, inTable: false },
                { name: 'Performance tracking', labelInTable: 'Performance tracking', starter: false, growth: false, enterprise: true, inCard: true, inTable: false },
                { name: 'Advanced reporting', labelInTable: 'Advanced reporting', starter: false, growth: false, enterprise: true, inCard: false },
            ]
        },
        {
            name: 'Integrations & Automation',
            labelInTable: 'Integrations & Support',
            features: [
                { name: 'API integrations', labelInTable: 'API access', starter: false, growth: false, enterprise: true, inCard: true },
                { name: 'Advanced workflow automation', labelInTable: 'Advanced workflow automation', starter: false, growth: false, enterprise: true, inCard: true, inTable: false },
                { name: 'System integrations', labelInTable: 'System integrations', starter: false, growth: false, enterprise: true, inCard: true, inTable: false },
                { name: 'Priority support', labelInTable: 'Priority support', starter: false, growth: false, enterprise: true, inCard: true },
                { name: 'Dedicated assistance', labelInTable: 'Dedicated assistance', starter: false, growth: false, enterprise: true, inCard: true, inTable: false }
            ]
        }
    ]
};
