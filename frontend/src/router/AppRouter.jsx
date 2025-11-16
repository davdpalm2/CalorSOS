// src/router/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext.jsx";

import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Perfil from "../pages/Perfil.jsx";

import Alertas from "../pages/Alertas.jsx";
import PuntosHidratacion from "../pages/PuntosHidratacion.jsx";
import ZonasFrescas from "../pages/ZonasFrescas.jsx";
import Consejos from "../pages/Consejos.jsx";
import Configuracion from "../pages/Configuracion.jsx";
import Admin from "../pages/Admin.jsx";

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

      <Route
        path="/alertas"
        element={user ? <Alertas /> : <Navigate to="/login" />}
      />

      <Route
        path="/puntos-hidratacion"
        element={user ? <PuntosHidratacion /> : <Navigate to="/login" />}
      />

      <Route
        path="/zonas-frescas"
        element={user ? <ZonasFrescas /> : <Navigate to="/login" />}
      />

      <Route
        path="/consejos"
        element={user ? <Consejos /> : <Navigate to="/login" />}
      />

      <Route
        path="/configuracion"
        element={user ? <Configuracion /> : <Navigate to="/login" />}
      />

      <Route
        path="/admin"
        element={user && user.rol === "admin" ? <Admin /> : <Navigate to="/" />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}