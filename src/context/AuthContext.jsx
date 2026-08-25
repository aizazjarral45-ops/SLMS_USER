import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext";
import {
  clearStoredSession,
  getStoredSession,
  login as loginWithService,
  register as registerWithService,
} from "../services/authService";

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSession(getStoredSession());
    setLoading(false);
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
      logout() {
        clearStoredSession();
        setSession(null);
      },
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
