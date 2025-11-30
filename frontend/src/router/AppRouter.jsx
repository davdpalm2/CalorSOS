// Inicio AppRouter.jsx

// frontend/src/router/AppRouter.jsx

// Componente principal de enrutamiento de la aplicación

// Importaciones de React Router y contexto
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext.jsx";

// Importaciones de páginas
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

// Componente funcional principal del router
export default function AppRouter() {
    // Obtener estado del usuario y loading del contexto
    const { user, loading } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Rol Admin va directamente a panel de administracion
    useEffect(() => {
        if (!user) return;

        if (user.rol === "admin" && location.pathname !== "/admin") {
            navigate("/admin");
        }
    }, [user]);

    // Mostrar pantalla de carga mientras se verifica autenticación
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
            {/* Rutas públicas - accesibles sin autenticación */}
            <Route
                path="/login"
                element={!user ? <Login /> : <Navigate to="/" />}
            />

            <Route
                path="/register"
                element={!user ? <Register /> : <Navigate to="/" />}
            />

            {/* Rutas protegidas - requieren autenticación */}
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

            {/* Ruta administrativa - requiere rol de admin */}
            <Route
                path="/admin"
                element={user && user.rol === "admin" ? <Admin /> : <Navigate to="/" />}
            />

            {/* Ruta por defecto - redirige a home */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

// Fin AppRouter.jsx
