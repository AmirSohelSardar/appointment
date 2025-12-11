// src/context/AuthContext.jsx
import React, { createContext, useContext, useState } from "react";
import api from "../api/api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  // STAFF LOGIN (email + password) => returns token + user
  const loginStaff = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  // CANDIDATE LOGIN (appId + dob) => returns candidate user (no token)
  const loginCandidate = async (applicationId, dob) => {
    const res = await api.post("/auth/candidate-login", { applicationId, dob });
    // store candidate info locally (no token)
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginStaff, loginCandidate, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
