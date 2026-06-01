import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../config/firebase";
import type { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  logout: async () => {},
  setToken: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const t = await u.getIdToken();
        setTokenState(t);
        localStorage.setItem("token", t);
      } else {
        setTokenState(null);
        localStorage.removeItem("token");
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    await auth.signOut();
    localStorage.removeItem("token");
    setTokenState(null);
  };

  const setToken = (t: string) => {
    setTokenState(t);
    localStorage.setItem("token", t);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
