import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext";
import {
  getStoredSession,
  login as loginWithService,
  logout as logoutWithService,
  register as registerWithService,
} from "../services/authService";

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSession(getStoredSession());
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => setSession(null);
    window.addEventListener("slms:session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("slms:session-expired", handleSessionExpired);
  }, []);

  const value = useMemo(
    () => ({
      loading,
      isAuthenticated: Boolean(session?.token),
      user: session?.user || null,
      async login(credentials) {
        const nextSession = await loginWithService(credentials);
        setSession(nextSession);
        return nextSession;
      },
      async register(details) {
        const result = await registerWithService(details);
        if (result?.token) setSession(result);
        return result;
      },
      async logout() {
        try {
          await logoutWithService();
        } finally {
          setSession(null);
        }
      },
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
