import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useTheme } from './contexts/ThemeContext'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'
import Footer from './components/Footer'

// Pages
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
// Industries
import Pharmaceuticals from './pages/industries/Pharmaceuticals'
import FMCG from './pages/industries/FMCG'
import Automotive from './pages/industries/Automotive'
import Fashion from './pages/industries/Fashion'

// Technology
import Technology from './pages/technology/Technology'

// Solutions
import AntiCounterfeit from './pages/solutions/AntiCounterfeit'
import TrackAndTrace from './pages/solutions/TrackAndTrace'
import DigitalWarranty from './pages/solutions/DigitalWarranty'
import ConsumerLoyalty from './pages/solutions/ConsumerLoyalty'
import ChannelLoyalty from './pages/solutions/ChannelLoyalty'

// Other
import LiveDemo from './pages/LiveDemo'
import { PrivacyPolicy, TermsConditions, SecurityPolicy } from './pages/Legal'

// Resources
import CaseStudies from './pages/resources/CaseStudies'
import Blog from './pages/resources/Blog'
import FAQs from './pages/resources/FAQs'
import Media from './pages/resources/Media'

import './index.css'

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const LandingLayout = () => (
  <>
    <Header />
    <main>
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <FAQ />
    </main>
    <Footer />
  </>
);

function App() {
  const { theme } = useTheme();

  return (
    <>
      {/* Background Aurora */}
      <div className="aurora-container">
        <div className="aurora-orb orb-1"></div>
        <div className="aurora-orb orb-2"></div>
      </div>

      <ScrollToTop />
      
      <Routes>
        <Route path="/" element={<LandingLayout />} />

        {/* Solutions */}
        <Route path="/solutions/anti-counterfeit" element={<AntiCounterfeit />} />
        <Route path="/solutions/track-and-trace" element={<TrackAndTrace />} />
        <Route path="/solutions/digital-warranty" element={<DigitalWarranty />} />
        <Route path="/solutions/consumer-loyalty" element={<ConsumerLoyalty />} />
        <Route path="/solutions/channel-loyalty" element={<ChannelLoyalty />} />

        {/* Industries */}
        <Route path="/industries/pharmaceuticals" element={<Pharmaceuticals />} />
        <Route path="/industries/fmcg" element={<FMCG />} />
        <Route path="/industries/automotive" element={<Automotive />} />
        <Route path="/industries/fashion" element={<Fashion />} />

        {/* Technology */}
        <Route path="/technology" element={<Technology />} />

        {/* Main Pages */}
        <Route path="/live-demo" element={<LiveDemo />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />

        {/* Resources */}
        <Route path="/resources/case-studies" element={<CaseStudies />} />
        <Route path="/resources/blog" element={<Blog />} />
        <Route path="/resources/faqs" element={<FAQs />} />
        <Route path="/resources/media" element={<Media />} />

        {/* Legal */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/security-policy" element={<SecurityPolicy />} />
      </Routes>
    </>
  )
}

export default App
