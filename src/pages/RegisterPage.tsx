import React, { useState } from "react";
import { registerUser } from "../services/auth/register";
import { loginWithFirebase } from "../services/auth/login";
import { useAuth } from "../context/AuthContext";

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setToken } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) { setError("Completa todos los campos"); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
    setLoading(true);
    setError("");
    try {
      await registerUser(email, password, fullName);
      const { token } = await loginWithFirebase(email, password);
      setToken(token);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Error al registrar";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "#0B0D19", border: "1px solid #1F243A",
    color: "#F0EBF8",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = "#38bdf850";
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = "#1F243A";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0B0D19" }}>
      <div className="orb" />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "#38bdf812", border: "1px solid #38bdf830" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
              <circle cx="9" cy="7" r="4" stroke="#38bdf8" strokeWidth="2" />
              <line x1="19" y1="8" x2="19" y2="14" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
              <line x1="22" y1="11" x2="16" y2="11" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#F0EBF8" }}>Crear cuenta</h1>
          <p style={{ color: "#7A6E8A" }}>Regístrate para empezar</p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm animate-fade-in"
              style={{ background: "#1f0a0a", color: "#f87171", border: "1px solid #f8717130" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#7A6E8A" }}>Nombre completo</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A6E8A" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre" onFocus={handleFocus} onBlur={handleBlur}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-smooth"
                  style={inputStyle} />
              </div>
            </div>

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
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com" onFocus={handleFocus} onBlur={handleBlur}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-smooth"
                  style={inputStyle} />
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
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres" onFocus={handleFocus} onBlur={handleBlur}
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-smooth"
                  style={inputStyle} />
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

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-smooth mt-2"
              style={{ background: loading ? "#38bdf860" : "#38bdf8", color: "#0B0D19", cursor: loading ? "not-allowed" : "pointer" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#7dd3fc"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#38bdf8"; }}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm" style={{ color: "#7A6E8A" }}>
          ¿Ya tienes cuenta?{" "}
          <button onClick={onNavigateToLogin} className="font-semibold transition-smooth" style={{ color: "#38bdf8" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#7dd3fc"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#38bdf8"}>
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
