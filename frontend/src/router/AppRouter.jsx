// src/router/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext.jsx";

import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Perfil from "../pages/Perfil.jsx";

export default function AppRouter() {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "22px"
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <Routes>

      {/* PÚBLICAS */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" />}
      />

      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/" />}
      />

      {/* PROTEGIDAS */}
      <Route
        path="/"
        element={user ? <Home /> : <Navigate to="/login" />}
      />

      <Route
        path="/perfil"
        element={user ? <Perfil /> : <Navigate to="/login" />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
