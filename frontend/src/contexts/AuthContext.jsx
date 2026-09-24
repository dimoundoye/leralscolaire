import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../services/db";

// La session est portée par un cookie httpOnly posé par le serveur : le jeton n'est jamais
// lisible par le JavaScript de la page. Seules les informations d'affichage de l'utilisateur
// sont gardées en localStorage, pour un affichage immédiat au rechargement.
const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

const readSavedUser = () => {
  try {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

// Données hors ligne du compte (cache de lecture et file d'envoi) : jamais partagées avec le compte suivant
const clearOfflineData = () =>
  Promise.all([db.cacheStore.clear(), db.outbox.clear()]).catch(() => {});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readSavedUser);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const endLocalSession = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // ancien stockage du jeton (versions précédentes)
    setUser(null);
    return clearOfflineData();
  }, []);

  // Au chargement : vérifier que le cookie de session est toujours valide
  useEffect(() => {
    if (!readSavedUser() || !navigator.onLine) return;
    fetch("/api/auth/me")
      .then((res) => {
        if (res.status === 401) {
          endLocalSession().then(() => navigate("/auth"));
        }
      })
      .catch(() => {
        // Hors ligne ou serveur injoignable : on garde la session locale
      });
  }, [endLocalSession, navigate]);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Hors ligne : le cookie expirera de lui-même
    }
    await endLocalSession();
    setLoading(false);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
