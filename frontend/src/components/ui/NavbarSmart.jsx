// src/components/ui/NavbarSmart.jsx
import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import logo from "../../assets/images/logo.svg";
import "../../assets/styles/NavbarSmart.css";

export default function NavbarSmart() {
  const { user, logout } = useContext(UserContext);
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // DEBUG
  useEffect(() => {
    console.log("User context en Navbar:", user);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Función para obtener el nombre del usuario
  const getUserName = () => {
    if (!user) return "Usuario";

    // Usar el nombre real si existe, sino fallback al email
    if (user.nombre) {
      return user.nombre;
    }

    // Intentar diferentes propiedades comunes
    return user.name || user.username || user.displayName || user.fullName || "Usuario";
  };

  // Obtener la primera letra del nombre para el avatar
  const getUserInitial = () => {
    const name = getUserName();
    return name !== "Usuario" ? name[0].toUpperCase() : "U";
  };

  // Obtener email si existe
  const getUserEmail = () => {
    return user?.email || user?.correo || "";
  };

  return (
    <header className="ns-header">
      {/* LEFT SIDE */}
      <div className="ns-left">
        <div className="ns-brand">
          <img src={logo} alt="CalorSOS Logo" className="ns-logo-img" />
          <span className="ns-brand__title">CalorSOS</span>
        </div>

        <nav className="ns-nav">
          <NavLink to="/" className={({ isActive }) => 
            `ns-link ${isActive ? "active" : ""}`
          }>
            Inicio
          </NavLink>
          <NavLink to="/zonas-frescas" className={({ isActive }) =>
            `ns-link ${isActive ? "active" : ""}`
          }>
            Zonas Frescas
          </NavLink>
          <NavLink to="/puntos-hidratacion" className={({ isActive }) =>
            `ns-link ${isActive ? "active" : ""}`
          }>
            Puntos de Hidratación
          </NavLink>
          <NavLink to="/alertas" className={({ isActive }) =>
            `ns-link ${isActive ? "active" : ""}`
          }>
            Alertas
          </NavLink>
          <NavLink to="/consejos" className={({ isActive }) =>
            `ns-link ${isActive ? "active" : ""}`
          }>
            Consejos
          </NavLink>
        </nav>
      </div>

      {/* RIGHT SIDE */}
      <div className="ns-right" ref={menuRef}>
        {/* Mensaje de bienvenida */}
        <div className="ns-welcome-message">
          Hola <span className="ns-username">{getUserName()}</span>
        </div>

        {/* AVATAR QUE SE VE COMO BOTÓN */}
        <div 
          className="ns-avatar-btn" 
          onClick={() => setOpenMenu(!openMenu)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setOpenMenu(!openMenu);
            }
          }}
        >
          <div className="ns-avatar">
            {getUserInitial()}
          </div>
        </div>

        {openMenu && (
          <div className="ns-profile-menu">
            <div className="ns-profile-header">
              <div className="ns-profile-name">{getUserName()}</div>
              {getUserEmail() && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {getUserEmail()}
                </div>
              )}
            </div>

            <button
              className="ns-profile-item"
              onClick={() => {
                setOpenMenu(false); // Cerrar dropdown
                setTimeout(() => navigate("/perfil"), 150); // Pequeño delay para animación
              }}
            >
              Ver perfil
            </button>
            <button
              className="ns-profile-item"
              onClick={() => {
                setOpenMenu(false);
                navigate("/configuracion");
              }}
            >
              Configuración
            </button>
            {user && user.rol === "admin" && (
              <button
                className="ns-profile-item admin-link"
                onClick={() => {
                  setOpenMenu(false);
                  navigate("/admin");
                }}
              >
                Panel de Administración
              </button>
            )}

            <hr />

            <button 
              className="ns-profile-item logout" 
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}