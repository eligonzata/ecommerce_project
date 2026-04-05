// context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";
import { useLocalStorage } from "../app/hooks/useLocalStorage";

const AuthContext = createContext(undefined);

function userDataMatchesExpectedSchema(user) {
  if (user === null || user === undefined) {
    return true;
  }
  if (!user?.id || !user?.email || !user?.name || !user?.role) {
    return false;
  }
  return true;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage("user", null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, [setUser]);

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  }, [setUser]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!userDataMatchesExpectedSchema(user)) {
      logout();
    }
  }, [user, hasHydrated, logout]);

  const contextValue = {
    user,
    setUser,
    login,
    logout,
    hasHydrated,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
