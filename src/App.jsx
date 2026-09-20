import { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/common/Navbar";
import { LandingPage } from "./components/public/LandingPage";
import { LoginModal } from "./components/auth/LoginModal";
import { ApplyToJoinModal } from "./components/auth/ApplyToJoinModal";
import { DonorDashboard } from "./components/donor/DonorDashboard";
import { NgoDashboard } from "./components/ngo/NgoDashboard";
import { VolunteerDashboard } from "./components/volunteer/VolunteerDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { SuperAdminDashboard } from "./components/admin/SuperAdminDashboard";
import { DemoBar } from "./components/demo/DemoBar";
const MainLayout = () => {
  const { currentUser, isAuthenticated } = useApp();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  return <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased flex flex-col justify-between selection:bg-purple-600 selection:text-white">
      <div>
        {
    /* Navigation Bar */
  }
        <Navbar
    onOpenLogin={() => setIsLoginOpen(true)}
    onOpenApply={() => setIsApplyOpen(true)}
  />

        {
    /* Main Content View */
  }
        {!isAuthenticated || !currentUser ? <LandingPage
    onOpenLogin={() => setIsLoginOpen(true)}
    onOpenApply={() => setIsApplyOpen(true)}
  /> : <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
            {currentUser.role === "DONOR" && <DonorDashboard />}
            {currentUser.role === "NGO" && <NgoDashboard />}
            {currentUser.role === "VOLUNTEER" && <VolunteerDashboard />}
            {currentUser.role === "ADMIN" && <AdminDashboard />}
            {currentUser.role === "SUPER_ADMIN" && <SuperAdminDashboard />}
          </main>}
      </div>

      {
    /* Global Clean Production Footer (Only when authenticated, landing has its own) */
  }
      {isAuthenticated && <footer className="border-t border-slate-200/80 bg-white py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">NourishNet Surat</span>
              <span>·</span>
              <span>Community Surplus Food Recovery & Redistribution Network</span>
            </div>

            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
              <span>Smart Match Coordination</span>
              <span>•</span>
              <span>Cryptographic QR Verification</span>
              <span>•</span>
              <span>Zero Food Waste Surat</span>
            </div>
          </div>
        </footer>}

      {
    /* Global Floating Demo Controller (Enabled when Demo Mode is ON) */
  }
      <DemoBar />

      {
    /* Authentication & Onboarding Modals */
  }
      <LoginModal
    isOpen={isLoginOpen}
    onClose={() => setIsLoginOpen(false)}
    onOpenApply={() => setIsApplyOpen(true)}
  />

      <ApplyToJoinModal
    isOpen={isApplyOpen}
    onClose={() => setIsApplyOpen(false)}
  />
    </div>;
};
function App() {
  return <AppProvider>
      <MainLayout />
    </AppProvider>;
}
export {
  App as default
};
