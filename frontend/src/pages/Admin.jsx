// src/pages/Admin.jsx
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import Navbar from "../components/ui/NavbarSmart.jsx";
import { listarReportes, validarReporte, rechazarReporte } from "../services/reportesService.js";
import zonasService from "../services/zonasService.js";
import puntosService from "../services/puntosService.js";
import { listarUsuarios, actualizarUsuario, eliminarUsuario } from "../services/usuariosService.js";
import ReportModal from "../components/report/ReportModal.jsx";
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

  // Estados para modales
  const [openEditZonaModal, setOpenEditZonaModal] = useState(false);
  const [zonaToEdit, setZonaToEdit] = useState(null);
  const [openEditPuntoModal, setOpenEditPuntoModal] = useState(false);
  const [puntoToEdit, setPuntoToEdit] = useState(null);

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
      // Cargar todas las zonas (activas e inactivas) para admin
      const data = await zonasService.listarZonas(null);
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
      // Para administradores: mostrar TODOS los puntos (activos e inactivos)
      const data = await puntosService.obtenerPuntosHidratacion(null); // null = todos los puntos
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
            ) : reportes.length === 0 ? (
              <div className="admin-empty-state">
                <p>No hay reportes registrados</p>
              </div>
            ) : (
              <div className="admin-list">
                {reportes.map((reporte) => (
                  <div key={reporte.id_reporte} className="admin-item">
                    <div className="admin-item-info">
                      <h3>{reporte.nombre || "Sin nombre"}</h3>
                      <p><strong>Tipo:</strong> {reporte.tipo}</p>
                      <p><strong>Estado:</strong> {reporte.estado}</p>
                      <p><strong>Usuario ID:</strong> {reporte.id_usuario}</p>
                      {reporte.descripcion && <p><strong>Descripción:</strong> {reporte.descripcion}</p>}
                      {reporte.latitud && reporte.longitud && (
                        <p><strong>Ubicación:</strong> {reporte.latitud.toFixed(6)}, {reporte.longitud.toFixed(6)}</p>
                      )}
                      {reporte.tipo_zona_fresca && <p><strong>Tipo Zona:</strong> {reporte.tipo_zona_fresca}</p>}
                      {reporte.fecha_reporte && <p><strong>Fecha:</strong> {new Date(reporte.fecha_reporte).toLocaleString()}</p>}
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
                      <p><strong>Estado:</strong> {zona.estado}</p>
                      <p><strong>Tipo:</strong> {zona.tipo}</p>
                      {zona.descripcion && <p><strong>Descripción:</strong> {zona.descripcion}</p>}
                      {zona.latitud && zona.longitud && (
                        <p><strong>Ubicación:</strong> {zona.latitud.toFixed(6)}, {zona.longitud.toFixed(6)}</p>
                      )}
                      {zona.validado_por && <p><strong>Validado por:</strong> {zona.validado_por}</p>}
                      {zona.fecha_registro && <p><strong>Fecha registro:</strong> {new Date(zona.fecha_registro).toLocaleString()}</p>}
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
                        className="admin-btn edit"
                        onClick={() => {
                          setZonaToEdit(zona);
                          setOpenEditZonaModal(true);
                        }}
                      >
                        Editar Datos
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
                      <p><strong>Estado:</strong> {punto.estado}</p>
                      {punto.descripcion && <p><strong>Descripción:</strong> {punto.descripcion}</p>}
                      {punto.latitud && punto.longitud && (
                        <p><strong>Ubicación:</strong> {punto.latitud.toFixed(6)}, {punto.longitud.toFixed(6)}</p>
                      )}
                      {punto.validado_por && <p><strong>Validado por:</strong> {punto.validado_por}</p>}
                      {punto.fecha_registro && <p><strong>Fecha registro:</strong> {new Date(punto.fecha_registro).toLocaleString()}</p>}
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
                        className="admin-btn edit"
                        onClick={() => {
                          setPuntoToEdit(punto);
                          setOpenEditPuntoModal(true);
                        }}
                      >
                        Editar Datos
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
                      {usuario.rol !== "admin" && (
                        <button
                          className="admin-btn edit"
                          onClick={() => {
                            const nuevoRol = usuario.rol === "admin" ? "usuario" : "admin";
                            handleActualizarUsuario(usuario.id_usuario, { rol: nuevoRol });
                          }}
                        >
                          Cambiar Rol
                        </button>
                      )}
                      {usuario.rol !== "admin" && (
                        <button
                          className="admin-btn delete"
                          onClick={() => handleEliminarUsuario(usuario.id_usuario)}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para editar zona */}
      <ReportModal
        open={openEditZonaModal}
        onClose={() => {
          setOpenEditZonaModal(false);
          setZonaToEdit(null);
        }}
      >
        <h2 className="rm-title">Editar Zona Fresca</h2>
        <form
          className="rm-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updates = {
              nombre: formData.get("nombre"),
              descripcion: formData.get("descripcion"),
              tipo: formData.get("tipo")
            };

            try {
              await handleActualizarZona(zonaToEdit.id_zona, updates);
              setOpenEditZonaModal(false);
              setZonaToEdit(null);
            } catch (error) {
              alert("Error al actualizar zona");
            }
          }}
        >
          <div>
            <label className="rm-label" htmlFor="nombre">Nombre:</label>
            <input
              className="rm-input"
              type="text"
              id="nombre"
              name="nombre"
              defaultValue={zonaToEdit?.nombre || ""}
              required
            />
          </div>

          <div>
            <label className="rm-label" htmlFor="descripcion">Descripción:</label>
            <textarea
              className="rm-textarea"
              id="descripcion"
              name="descripcion"
              defaultValue={zonaToEdit?.descripcion || ""}
            />
          </div>

          <div>
            <label className="rm-label" htmlFor="tipo">Tipo:</label>
            <select
              className="rm-input"
              id="tipo"
              name="tipo"
              defaultValue={zonaToEdit?.tipo || "urbana"}
              required
            >
              <option value="urbana">Urbana</option>
              <option value="natural">Natural</option>
              <option value="artificial">Artificial</option>
            </select>
          </div>

          <div className="rm-actions">
            <button
              type="button"
              className="rm-btn-cancel"
              onClick={() => {
                setOpenEditZonaModal(false);
                setZonaToEdit(null);
              }}
            >
              Cancelar
            </button>
            <button type="submit" className="rm-btn-send">
              Actualizar Zona
            </button>
          </div>
        </form>
      </ReportModal>

      {/* Modal para editar punto */}
      <ReportModal
        open={openEditPuntoModal}
        onClose={() => {
          setOpenEditPuntoModal(false);
          setPuntoToEdit(null);
        }}
      >
        <h2 className="rm-title">Editar Punto de Hidratación</h2>
        <form
          className="rm-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updates = {
              nombre: formData.get("nombre"),
              descripcion: formData.get("descripcion")
            };

            try {
              await handleActualizarPunto(puntoToEdit.id_punto, updates);
              setOpenEditPuntoModal(false);
              setPuntoToEdit(null);
            } catch (error) {
              alert("Error al actualizar punto");
            }
          }}
        >
          <div>
            <label className="rm-label" htmlFor="nombre_punto">Nombre:</label>
            <input
              className="rm-input"
              type="text"
              id="nombre_punto"
              name="nombre"
              defaultValue={puntoToEdit?.nombre || ""}
              required
            />
          </div>

          <div>
            <label className="rm-label" htmlFor="descripcion_punto">Descripción:</label>
            <textarea
              className="rm-textarea"
              id="descripcion_punto"
              name="descripcion"
              defaultValue={puntoToEdit?.descripcion || ""}
            />
          </div>

          <div className="rm-actions">
            <button
              type="button"
              className="rm-btn-cancel"
              onClick={() => {
                setOpenEditPuntoModal(false);
                setPuntoToEdit(null);
              }}
            >
              Cancelar
            </button>
            <button type="submit" className="rm-btn-send">
              Actualizar Punto
            </button>
          </div>
        </form>
      </ReportModal>
    </div>
  );
}
