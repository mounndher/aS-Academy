import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { SiteUIProvider } from "@/context/SiteUIContext";
import { pageTransition } from "@/lib/motion";
import { Navbar } from "@/components/layout/Navbar";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Footer } from "@/components/layout/Footer";
import { MobileStickyCTA } from "@/components/layout/MobileStickyCTA";
import { HomePage } from "@/pages/HomePage";
import { FormationsListPage } from "@/pages/FormationsListPage";
import { FormationDetailPage } from "@/pages/FormationDetailPage";

function Layout() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-ivory text-ink">
      <Navbar />
      <MobileMenu />

      <AnimatePresence mode="wait" initial={false}>
        <motion.main key={location.pathname} {...pageTransition}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/formations" element={<FormationsListPage />} />
            <Route path="/formations/:slug" element={<FormationDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.main>
      </AnimatePresence>

      <Footer />
      <MobileStickyCTA />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <MotionConfig reducedMotion="user">
        <SiteUIProvider>
          <Layout />
        </SiteUIProvider>
      </MotionConfig>
    </HashRouter>
  );
}
