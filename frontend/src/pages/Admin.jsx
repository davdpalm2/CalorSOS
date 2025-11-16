// src/pages/Admin.jsx
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import Navbar from "../components/ui/NavbarSmart.jsx";
import { listarReportes, validarReporte, rechazarReporte } from "../services/reportesService.js";
import zonasService from "../services/zonasService.js";
import puntosService from "../services/puntosService.js";
import { listarUsuarios, actualizarUsuario, eliminarUsuario } from "../services/usuariosService.js";
import "../assets/styles/Admin.css";

export default function Admin() {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("reportes");

  // Estados para reportes
  const [reportes, setReportes] = useState([]);
  const [loadingReportes, setLoadingReportes] = useState(true);

  // Estados para zonas
  const [zonas, setZonas] = useState([]);
  const [loadingZonas, setLoadingZonas] = useState(false);

  // Estados para puntos
  const [puntos, setPuntos] = useState([]);
  const [loadingPuntos, setLoadingPuntos] = useState(false);

  // Estados para usuarios
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  // Cargar datos según la pestaña activa
  useEffect(() => {
    if (activeTab === "reportes") {
      cargarReportes();
    } else if (activeTab === "zonas") {
      cargarZonas();
    } else if (activeTab === "puntos") {
      cargarPuntos();
    } else if (activeTab === "usuarios") {
      cargarUsuarios();
    }
  }, [activeTab]);

  const cargarReportes = async () => {
    try {
      setLoadingReportes(true);
      const data = await listarReportes();
      setReportes(data);
    } catch (error) {
      console.error("Error cargando reportes:", error);
      alert("Error al cargar reportes");
    } finally {
      setLoadingReportes(false);
    }
  };

  const cargarZonas = async () => {
    try {
      setLoadingZonas(true);
      const data = await zonasService.listarZonas();
      setZonas(data);
    } catch (error) {
      console.error("Error cargando zonas:", error);
      alert("Error al cargar zonas");
    } finally {
      setLoadingZonas(false);
    }
  };

  const cargarPuntos = async () => {
    try {
      setLoadingPuntos(true);
      const data = await puntosService.obtenerPuntosHidratacion();
      setPuntos(data);
    } catch (error) {
      console.error("Error cargando puntos:", error);
      alert("Error al cargar puntos");
    } finally {
      setLoadingPuntos(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const data = await listarUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      alert("Error al cargar usuarios");
    } finally {
      setLoadingUsuarios(false);
    }
  };

  // Funciones para reportes
  const handleValidarReporte = async (id) => {
    try {
      await validarReporte(id);
      alert("Reporte validado correctamente");
      cargarReportes();
    } catch (error) {
      alert("Error al validar reporte");
    }
  };

  const handleRechazarReporte = async (id) => {
    try {
      await rechazarReporte(id);
      alert("Reporte rechazado correctamente");
      cargarReportes();
    } catch (error) {
      alert("Error al rechazar reporte");
    }
  };

  // Funciones para zonas
  const handleActualizarZona = async (id, data) => {
    try {
      await zonasService.actualizarZona(id, data);
      alert("Zona actualizada correctamente");
      cargarZonas();
    } catch (error) {
      alert("Error al actualizar zona");
    }
  };

  const handleEliminarZona = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta zona?")) {
      try {
        await zonasService.eliminarZona(id);
        alert("Zona eliminada correctamente");
        cargarZonas();
      } catch (error) {
        alert("Error al eliminar zona");
      }
    }
  };

  // Funciones para puntos
  const handleActualizarPunto = async (id, data) => {
    try {
      await puntosService.actualizarPunto(id, data);
      alert("Punto actualizado correctamente");
      cargarPuntos();
    } catch (error) {
      alert("Error al actualizar punto");
    }
  };

  const handleEliminarPunto = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este punto?")) {
      try {
        await puntosService.eliminarPunto(id);
        alert("Punto eliminado correctamente");
        cargarPuntos();
      } catch (error) {
        alert("Error al eliminar punto");
      }
    }
  };

  // Funciones para usuarios
  const handleActualizarUsuario = async (id, data) => {
    try {
      await actualizarUsuario(id, data);
      alert("Usuario actualizado correctamente");
      cargarUsuarios();
    } catch (error) {
      alert("Error al actualizar usuario");
    }
  };

  const handleEliminarUsuario = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await eliminarUsuario(id);
        alert("Usuario eliminado correctamente");
        cargarUsuarios();
      } catch (error) {
        alert("Error al eliminar usuario");
      }
    }
  };

  if (!user || user.rol !== "admin") {
    return <div>No tienes permisos para acceder a esta página</div>;
  }

  return (
    <div className="admin-container">
      <Navbar />
      <div className="admin-content">
        <h1>Panel de Administración</h1>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "reportes" ? "active" : ""}`}
            onClick={() => setActiveTab("reportes")}
          >
            Reportes
          </button>
          <button
            className={`admin-tab ${activeTab === "zonas" ? "active" : ""}`}
            onClick={() => setActiveTab("zonas")}
          >
            Zonas Frescas
          </button>
          <button
            className={`admin-tab ${activeTab === "puntos" ? "active" : ""}`}
            onClick={() => setActiveTab("puntos")}
          >
            Puntos de Hidratación
          </button>
          <button
            className={`admin-tab ${activeTab === "usuarios" ? "active" : ""}`}
            onClick={() => setActiveTab("usuarios")}
          >
            Usuarios
          </button>
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === "reportes" && (
          <div className="admin-section">
            <h2>Gestión de Reportes</h2>
            {loadingReportes ? (
              <p>Cargando reportes...</p>
            ) : (
              <div className="admin-list">
                {reportes.map((reporte) => (
                  <div key={reporte.id_reporte} className="admin-item">
                    <div className="admin-item-info">
                      <h3>{reporte.nombre || "Sin nombre"}</h3>
                      <p>Tipo: {reporte.tipo}</p>
                      <p>Estado: {reporte.estado}</p>
                      <p>Usuario: {reporte.id_usuario}</p>
                    </div>
                    <div className="admin-item-actions">
                      {reporte.estado === "pendiente" && (
                        <>
                          <button
                            className="admin-btn approve"
                            onClick={() => handleValidarReporte(reporte.id_reporte)}
                          >
                            Validar
                          </button>
                          <button
                            className="admin-btn reject"
                            onClick={() => handleRechazarReporte(reporte.id_reporte)}
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "zonas" && (
          <div className="admin-section">
            <h2>Gestión de Zonas Frescas</h2>
            {loadingZonas ? (
              <p>Cargando zonas...</p>
            ) : (
              <div className="admin-list">
                {zonas.map((zona) => (
                  <div key={zona.id_zona} className="admin-item">
                    <div className="admin-item-info">
                      <h3>{zona.nombre}</h3>
                      <p>Estado: {zona.estado}</p>
                      <p>Tipo: {zona.tipo}</p>
                    </div>
                    <div className="admin-item-actions">
                      <button
                        className="admin-btn edit"
                        onClick={() => {
                          const nuevoEstado = zona.estado === "activa" ? "inactiva" : "activa";
                          handleActualizarZona(zona.id_zona, { estado: nuevoEstado });
                        }}
                      >
                        Cambiar Estado
                      </button>
                      <button
                        className="admin-btn delete"
                        onClick={() => handleEliminarZona(zona.id_zona)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "puntos" && (
          <div className="admin-section">
            <h2>Gestión de Puntos de Hidratación</h2>
            {loadingPuntos ? (
              <p>Cargando puntos...</p>
            ) : (
              <div className="admin-list">
                {puntos.map((punto) => (
                  <div key={punto.id_punto} className="admin-item">
                    <div className="admin-item-info">
                      <h3>{punto.nombre}</h3>
                      <p>Estado: {punto.estado}</p>
                    </div>
                    <div className="admin-item-actions">
                      <button
                        className="admin-btn edit"
                        onClick={() => {
                          const nuevoEstado = punto.estado === "activa" ? "inactiva" : "activa";
                          handleActualizarPunto(punto.id_punto, { estado: nuevoEstado });
                        }}
                      >
                        Cambiar Estado
                      </button>
                      <button
                        className="admin-btn delete"
                        onClick={() => handleEliminarPunto(punto.id_punto)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "usuarios" && (
          <div className="admin-section">
            <h2>Gestión de Usuarios</h2>
            {loadingUsuarios ? (
              <p>Cargando usuarios...</p>
            ) : (
              <div className="admin-list">
                {usuarios.map((usuario) => (
                  <div key={usuario.id_usuario} className="admin-item">
                    <div className="admin-item-info">
                      <h3>{usuario.nombre}</h3>
                      <p>Email: {usuario.correo}</p>
                      <p>Rol: {usuario.rol}</p>
                    </div>
                    <div className="admin-item-actions">
                      <button
                        className="admin-btn edit"
                        onClick={() => {
                          const nuevoRol = usuario.rol === "admin" ? "usuario" : "admin";
                          handleActualizarUsuario(usuario.id_usuario, { rol: nuevoRol });
                        }}
                      >
                        Cambiar Rol
                      </button>
                      <button
                        className="admin-btn delete"
                        onClick={() => handleEliminarUsuario(usuario.id_usuario)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
