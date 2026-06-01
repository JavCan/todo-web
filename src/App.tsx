import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import "./index.css";

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<"login" | "register">("login");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0D19" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "#38bdf812", border: "1px solid #38bdf830" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 11l3 3L22 4" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#38bdf8", borderTopColor: "transparent" }} />
        </div>
      </div>
    );
  }

  if (!user) {
    if (page === "register") {
      return <RegisterPage onNavigateToLogin={() => setPage("login")} />;
    }
    return <LoginPage onNavigateToRegister={() => setPage("register")} />;
  }

  return <HomePage />;
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
