import React, { useState } from "react";
import { loginWithFirebase } from "../services/auth/login";
import { useAuth } from "../context/AuthContext";

interface LoginPageProps {
  onNavigateToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setToken } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Completa todos los campos"); return; }
    setLoading(true);
    setError("");
    try {
      const { token } = await loginWithFirebase(email, password);
      setToken(token);
    } catch (err: any) {
      setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0B0D19" }}>
      <div className="orb" />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "#38bdf812", border: "1px solid #38bdf830" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M9 11l3 3L22 4" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#F0EBF8" }}>Bienvenido</h1>
          <p style={{ color: "#7A6E8A" }}>Inicia sesión para continuar</p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm animate-fade-in"
              style={{ background: "#1f0a0a", color: "#f87171", border: "1px solid #f8717130" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#7A6E8A" }}>Correo</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A6E8A" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-smooth"
                  style={{
                    background: "#0B0D19", border: "1px solid #1F243A",
                    color: "#F0EBF8",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#38bdf850"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#1F243A"}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#7A6E8A" }}>Contraseña</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A6E8A" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-smooth"
                  style={{
                    background: "#0B0D19", border: "1px solid #1F243A",
                    color: "#F0EBF8",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#38bdf850"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#1F243A"}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-smooth"
                  style={{ color: "#7A6E8A" }}>
                  {showPw ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-smooth mt-2"
              style={{
                background: loading ? "#38bdf860" : "#38bdf8",
                color: "#0B0D19",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#7dd3fc"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#38bdf8"; }}
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm" style={{ color: "#7A6E8A" }}>
          ¿No tienes cuenta?{" "}
          <button onClick={onNavigateToRegister}
            className="font-semibold transition-smooth"
            style={{ color: "#38bdf8" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#7dd3fc"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#38bdf8"}>
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
