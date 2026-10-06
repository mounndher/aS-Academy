import {
  AnimatePresence,
  MotionConfig,
  motion,
} from "framer-motion";

import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { SiteUIProvider } from "@/context/SiteUIContext";
import { pageTransition } from "@/lib/motion";

import { Navbar } from "@/components/layout/Navbar";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Footer } from "@/components/layout/Footer";
import { MobileStickyCTA } from "@/components/layout/MobileStickyCTA";
import ScrollToTop from "@/components/ScrollToTop";

import { HomePage } from "@/pages/HomePage";
import { FormationsListPage } from "@/pages/FormationsListPage";
import { FormationDetailPage } from "@/pages/FormationDetailPage";

/* =========================================================
   LAYOUT
========================================================= */

function Layout() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />

      <div className="relative min-h-screen bg-ivory text-ink">
        <Navbar />

        <MobileMenu />

        <AnimatePresence
          mode="wait"
          initial={false}
        >
          <motion.main
            key={location.pathname}
            {...pageTransition}
          >
            <Routes location={location}>
              {/* HOME */}
              <Route
                path="/"
                element={<HomePage />}
              />

              {/* ALL FORMATIONS */}
              <Route
                path="/formations"
                element={<FormationsListPage />}
              />

              {/* FORMATION DETAIL */}
              <Route
                path="/formations/:slug"
                element={<FormationDetailPage />}
              />

              {/* OPTIONAL RESERVATION ROUTE */}
              <Route
                path="/formations/:slug/reservation"
                element={<FormationDetailPage />}
              />

              {/* FALLBACK */}
              <Route
                path="*"
                element={
                  <Navigate
                    to="/"
                    replace
                  />
                }
              />
            </Routes>
          </motion.main>
        </AnimatePresence>

        <Footer />

        <MobileStickyCTA />
      </div>
    </>
  );
}

/* =========================================================
   APP
========================================================= */

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