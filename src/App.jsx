import { useState, useEffect } from "react";
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
import { DemoDrawer } from "./components/demo/DemoDrawer";

const MainLayout = () => {
  const { currentUser, isAuthenticated, demoMode } = useApp();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false);
  const [prefillCreds, setPrefillCreds] = useState({ email: "", password: "" });

  // Global keyboard listener for Ctrl key to toggle Demo Mode when on login/landing view
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ONLY trigger on Ctrl key when demoMode is active and user is not in another input-heavy flow
      if (e.key === "Control" || (e.ctrlKey && !e.altKey && !e.metaKey && e.key === "Control")) {
        if (demoMode) {
          setIsDemoDrawerOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [demoMode]);

  const handleSelectCredentials = (email, password) => {
    setPrefillCreds({ email, password });
    setIsLoginOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-[#2C1810] antialiased flex flex-col justify-between selection:bg-[#C85A32] selection:text-white">
      <div>
        {/* Navigation Bar */}
        <Navbar
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenApply={() => setIsApplyOpen(true)}
          onOpenDemo={() => setIsDemoDrawerOpen(true)}
        />

        {/* Main Content View */}
        {!isAuthenticated || !currentUser ? (
          <LandingPage
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenApply={() => setIsApplyOpen(true)}
            onOpenDemo={() => setIsDemoDrawerOpen(true)}
          />
        ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
            {currentUser.role === "DONOR" && <DonorDashboard />}
            {currentUser.role === "NGO" && <NgoDashboard />}
            {currentUser.role === "VOLUNTEER" && <VolunteerDashboard />}
            {currentUser.role === "ADMIN" && <AdminDashboard />}
            {currentUser.role === "SUPER_ADMIN" && <SuperAdminDashboard />}
          </main>
        )}
      </div>

      {/* Authenticated Global Footer */}
      {isAuthenticated && (
        <footer className="border-t border-[#E7DCD5] bg-white py-6 mt-12 text-center text-xs text-[#5D4037]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#2C1810]">NourishNet Surat</span>
              <span>·</span>
              <span>Surplus Food Recovery & Redistribution Network</span>
            </div>

            <div className="flex items-center gap-4 text-[#8D6E63] text-[11px]">
              <span>Smart Match Coordination</span>
              <span>•</span>
              <span>OTP / Cryptographic QR Verification</span>
              <span>•</span>
              <span>Zero Food Waste Surat</span>
            </div>
          </div>
        </footer>
      )}

      {/* Floating Demo Bar (Visible when authenticated and Demo Mode is ON) */}
      {isAuthenticated && <DemoBar />}

      {/* Demo Mode Drawer (25 demo users across all 5 roles) */}
      <DemoDrawer
        isOpen={isDemoDrawerOpen}
        onClose={() => setIsDemoDrawerOpen(false)}
        onSelectCredentials={handleSelectCredentials}
      />

      {/* Authentication & Onboarding Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenApply={() => setIsApplyOpen(true)}
        onOpenDemo={() => setIsDemoDrawerOpen(true)}
        prefillEmail={prefillCreds.email}
        prefillPassword={prefillCreds.password}
      />

      <ApplyToJoinModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
      />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
