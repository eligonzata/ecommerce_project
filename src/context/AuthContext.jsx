// context/AuthContext.js
import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useLocalStorage } from "../app/hooks/useLocalStorage";

const AuthContext = createContext(undefined);

function userDataMatchesExpectedSchema(user) {
  if (user === undefined) {
    return true;
  }
  if (!user?.id || !user?.email || !user?.name || !user?.role) {
    return false;
  }
  return true;
}

export const AuthProvider = ({ children }) => {
  // Initialize 'user' state using the custom hook
  // It automatically tries to load the value from localStorage['user']
  const [user, setUser] = useLocalStorage("user", null);

  useEffect(() => {
    // validates the user object, logs out if corrupted
    if (!userDataMatchesExpectedSchema(user)) {
      logout();
    }
  }, [user]);

  // Function to handle login (sets user in context and localStorage)
  const login = (userData) => {
    // Perform actual authentication (e.g., API call) here
    // On success, set the user data
    setUser(userData);
  };

  // Function to handle logout (clears user from context and localStorage)
  const logout = () => {
    setUser(null);
    localStorage.clear(); // Optional: clear all local storage on logout
  };

  // The value provided to all children components
  const contextValue = {
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to easily consume the AuthContext in functional components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
