  // Inicio Admin.jsx

// frontend/src/pages/Admin.jsx

// Página de panel de administración para gestionar reportes, zonas, puntos y usuarios

// Importaciones de React y hooks
import React, { useState, useEffect, useContext } from "react";

// Importación del contexto de usuario
import { UserContext } from "../context/UserContext";

// Importación de servicios
import { listarReportes, validarReporte, rechazarReporte } from "../services/reportesService.js";
import zonasService from "../services/zonasService.js";
import puntosService from "../services/puntosService.js";
import { listarUsuarios, actualizarUsuario, eliminarUsuario } from "../services/usuariosService.js";
import alertasService from "../services/alertasService.js";
import {
    listarNotificaciones,
    crearNotificacionGlobal,
    actualizarEstadoNotificacion,
    eliminarNotificacion
} from "../services/notificacionesApiService.js";

// Importación de modales
import EditZonaModal from "../components/ui/EditZonaModal.jsx";
import EditPuntoModal from "../components/ui/EditPuntoModal.jsx";
import MapFullscreenModal from "../components/maps/MapFullscreenModal.jsx";
import MapView from "../components/maps/MapView.jsx";

// Importación de estilos
import "../assets/styles/Admin.css";

// COMPONENTE PRINCIPAL
export default function Admin() {

  // Estados Usuario y pestañas
  const { user, logout } = useContext(UserContext);
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

  // Estados para alertas
  const [alertas, setAlertas] = useState([]);
  const [loadingAlertas, setLoadingAlertas] = useState(false);

  // Estados para notificaciones
  const [notificaciones, setNotificaciones] = useState([]);
  const [loadingNotificaciones, setLoadingNotificaciones] = useState(false);

  // Estados para formularios
  const [nuevaAlerta, setNuevaAlerta] = useState({
    temperatura: '',
    humedad: '',
    indice_uv: '',
    nivel_riesgo: 'bajo',
    fuente: 'Manual'
  });
  const [nuevaNotificacion, setNuevaNotificacion] = useState({
    mensaje: ''
  });

  // Estados para modales
  const [openEditZonaModal, setOpenEditZonaModal] = useState(false);
  const [zonaToEdit, setZonaToEdit] = useState(null);
  const [openEditPuntoModal, setOpenEditPuntoModal] = useState(false);
  const [puntoToEdit, setPuntoToEdit] = useState(null);
  const [openMapModal, setOpenMapModal] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null);

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
    } else if (activeTab === "alertas") {
      cargarAlertas();
    } else if (activeTab === "notificaciones") {
      cargarNotificaciones();
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

  const cargarAlertas = async () => {
    try {
      setLoadingAlertas(true);
      const data = await alertasService.listarAlertas();
      setAlertas(data || []);
    } catch (error) {
      console.error("Error cargando alertas:", error);
      alert("Error al cargar alertas");
      setAlertas([]);
    } finally {
      setLoadingAlertas(false);
    }
  };

  const cargarNotificaciones = async () => {
    try {
      setLoadingNotificaciones(true);
      const data = await listarNotificaciones();
      setNotificaciones(data || []);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
      alert("Error al cargar notificaciones");
      setNotificaciones([]);
    } finally {
      setLoadingNotificaciones(false);
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

  // Funciones para alertas
  const handleCrearAlerta = async () => {
    try {
      await alertasService.crearAlerta(nuevaAlerta);
      alert("Alerta creada correctamente");
      setNuevaAlerta({
        temperatura: '',
        humedad: '',
        indice_uv: '',
        nivel_riesgo: 'bajo',
        fuente: 'Manual'
      });
      cargarAlertas();
    } catch (error) {
      alert("Error al crear alerta");
    }
  };

  const handleGenerarAlertaAutomatica = async () => {
    try {
      await alertasService.generarAlertaAutomatica();
      alert("Alerta automática generada correctamente");
      cargarAlertas();
    } catch (error) {
      alert("Error al generar alerta automática");
    }
  };

  const handleEliminarAlerta = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta alerta?")) {
      try {
        await alertasService.eliminarAlerta(id);
        alert("Alerta eliminada correctamente");
        cargarAlertas();
      } catch (error) {
        alert("Error al eliminar alerta");
      }
    }
  };

  // Funciones para notificaciones
  const handleCrearNotificacionGlobal = async () => {
    try {
      await crearNotificacionGlobal(nuevaNotificacion.mensaje);
      alert("Notificación global creada correctamente");
      setNuevaNotificacion({ mensaje: '' });
      cargarNotificaciones();
    } catch (error) {
      alert("Error al crear notificación global");
    }
  };

  const handleActualizarEstadoNotificacion = async (id, estado) => {
    try {
      await actualizarEstadoNotificacion(id, estado);
      alert("Estado de notificación actualizado correctamente");
      cargarNotificaciones();
    } catch (error) {
      alert("Error al actualizar estado de notificación");
    }
  };

  const handleEliminarNotificacion = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta notificación?")) {
      try {
        await eliminarNotificacion(id);
        alert("Notificación eliminada correctamente");
        cargarNotificaciones();
      } catch (error) {
        alert("Error al eliminar notificación");
      }
    }
  };

  if (!user || user.rol !== "admin") {
    return <div>No tienes permisos para acceder a esta página</div>;
  }
  // RENDER PRINCIPAL
  return (
    <div className="admin-container">
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
            className={`admin-tab ${activeTab === "alertas" ? "active" : ""}`}
            onClick={() => setActiveTab("alertas")}
          >
            Alertas de Calor
          </button>
          <button
            className={`admin-tab ${activeTab === "notificaciones" ? "active" : ""}`}
            onClick={() => setActiveTab("notificaciones")}
          >
            Notificaciones
          </button>
          <button
            className={`admin-tab ${activeTab === "usuarios" ? "active" : ""}`}
            onClick={() => setActiveTab("usuarios")}
          >
            Usuarios
          </button>
          <button
            className="pr-btn pr-btn--danger"
            onClick={logout}
          >
            Cerrar Sesión
          </button>
        </div>

        {/* SECCIÓN: Reportes */}
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
                      {reporte.latitud && reporte.longitud && (
                        <button
                          className="admin-btn edit"
                          onClick={() => {
                            setReporteSeleccionado(reporte);
                            setOpenMapModal(true);
                          }}
                        >
                          Ver reporte en el mapa
                        </button>
                      )}
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
        {/* SECCIÓN: Zonas Frescas */}
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
                      {zona.latitud && zona.longitud && (
                        <button
                          className="admin-btn edit"
                          onClick={() => {
                            setZonaSeleccionada(zona);
                            setOpenMapModal(true);
                          }}
                        >
                          Ver zona en el mapa
                        </button>
                      )}
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
        {/* SECCIÓN: Puntos de Hidratación */}
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
                      {punto.latitud && punto.longitud && (
                        <button
                          className="admin-btn edit"
                          onClick={() => {
                            setPuntoSeleccionado(punto);
                            setOpenMapModal(true);
                          }}
                        >
                          Ver punto en el mapa
                        </button>
                      )}
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
        {/* SECCIÓN: Alertas de Calor */}
        {activeTab === "alertas" && (
          <div className="admin-section">
            <h2>Gestión de Alertas de Calor</h2>

            {/* Lista de alertas */}
            {loadingAlertas ? (
              <p>Cargando alertas...</p>
            ) : alertas.length === 0 ? (
              <div className="admin-empty-state">
                <p>No hay alertas registradas</p>
              </div>
            ) : (
              <div className="admin-list">
                {alertas.map((alerta) => (
                  <div key={alerta.id_alerta} className="admin-item">
                    <div className="admin-item-info">
                      <h3>Nivel: {alerta.nivel_riesgo.toUpperCase()}</h3>
                      <p><strong>Temperatura:</strong> {alerta.temperatura}°C</p>
                      <p><strong>Humedad:</strong> {alerta.humedad}%</p>
                      <p><strong>UV:</strong> {alerta.indice_uv}</p>
                      <p><strong>Fuente:</strong> {alerta.fuente}</p>
                      <p><strong>Fecha:</strong> {new Date(alerta.fecha_alerta).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN: Notificaciones */}
        {activeTab === "notificaciones" && (
          <div className="admin-section">
            <h2>Gestión de Notificaciones</h2>

            {/* Lista de notificaciones */}
            {loadingNotificaciones ? (
              <p>Cargando notificaciones...</p>
            ) : notificaciones.length === 0 ? (
              <div className="admin-empty-state">
                <p>No hay notificaciones registradas</p>
              </div>
            ) : (
              <div className="admin-list">
                {notificaciones.map((notif) => (
                  <div key={notif.id_notificacion} className="admin-item">
                    <div className="admin-item-info">
                      <h3>{notif.mensaje.substring(0, 50)}...</h3>
                      <p><strong>Usuario ID:</strong> {notif.id_usuario}</p>
                      <p><strong>Estado:</strong> {notif.estado}</p>
                      <p><strong>Fecha:</strong> {new Date(notif.fecha_envio).toLocaleString()}</p>
                    </div>
                    <div className="admin-item-actions">
                      <button
                        className="admin-btn delete"
                        onClick={() => handleEliminarNotificacion(notif.id_notificacion)}
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

        {/* SECCIÓN: Usuarios */}
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
      <EditZonaModal
        open={openEditZonaModal}
        onClose={() => {
          setOpenEditZonaModal(false);
          setZonaToEdit(null);
        }}
        zona={zonaToEdit}
        onSave={async (updates) => {
          await handleActualizarZona(zonaToEdit.id_zona, updates);
        }}
      />

      {/* Modal para editar punto */}
      <EditPuntoModal
        open={openEditPuntoModal}
        onClose={() => {
          setOpenEditPuntoModal(false);
          setPuntoToEdit(null);
        }}
        punto={puntoToEdit}
        onSave={async (updates) => {
          await handleActualizarPunto(puntoToEdit.id_punto, updates);
        }}
      />

      {/* Modal para ver reporte en el mapa */}
      <MapFullscreenModal
        open={openMapModal}
        onClose={() => {
          setOpenMapModal(false);
          setReporteSeleccionado(null);
          setZonaSeleccionada(null);
          setPuntoSeleccionado(null);
        }}
      >
        <MapView
          mini={false}
          reportes={reporteSeleccionado ? [reporteSeleccionado] : []}
          zonasFrescas={zonaSeleccionada ? [zonaSeleccionada] : []}
          puntosHidratacion={puntoSeleccionado ? [puntoSeleccionado] : []}
        />
      </MapFullscreenModal>
    </div>
  );
}

// Fin Admin.jsx