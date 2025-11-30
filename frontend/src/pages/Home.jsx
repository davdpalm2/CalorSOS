// Inicio Home.jsx

// frontend/src/pages/Home.jsx

// Importaciones de React y hooks
import React, { useState, useEffect } from "react";

// Importaciones de React Router
import { useNavigate } from "react-router-dom";

// Importaciones de componentes de UI
import IndicatorsPanel from "../components/ui/IndicatorsPanel.jsx";
import Navbar from "../components/ui/NavbarSmart.jsx";
import ReportCallToAction from "../components/ui/ReportCTA.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import ClimateChart from "../components/ui/ClimateChart.jsx";

// Importaciones de componentes de mapa
import MapView from "../components/maps/MapView.jsx";
import MapFullscreenModal from "../components/maps/MapFullscreenModal.jsx";

// Importaciones de servicios
import { getClima } from "../services/climaService.js";
import zonasService from "../services/zonasService.js";
import puntosService from "../services/puntosService.js";
import alertasService from "../services/alertasService.js";
import notificacionesService from "../services/notificacionesService.js";
import notificacionesGlobalesService from "../services/notificacionesGlobalesService.js";

// Importación de utilidades de distancia
import { encontrarPuntoMasCercano } from "../utils/distanceUtils";

// Importaciones de datos
import { consejosData } from "../data/consejosData.js";

// Importaciones de estilos
import "../assets/styles/Home.css";
import "../assets/styles/PushNotification.css";

// Componente principal de la página Home
export default function Home() {
    const navigate = useNavigate();

    // Estado para controlar la apertura del mapa completo
    const [openMap, setOpenMap] = useState(false);

    // Estado para consejos aleatorios
    const [consejosAleatorios, setConsejosAleatorios] = useState([]);

    // Estados para datos del backend
    const [zonasFrescas, setZonasFrescas] = useState([]);
    const [puntosHidratacion, setPuntosHidratacion] = useState([]);

    // Estado para marcador seleccionado
    const [markerSeleccionado, setMarkerSeleccionado] = useState(null);

    // Estados para navegación a puntos más cercanos
    const [userLocation, setUserLocation] = useState(null);
    const [routeCoordinates, setRouteCoordinates] = useState(null);
    const [highlightedMarker, setHighlightedMarker] = useState(null);
    const [resetViewTrigger, setResetViewTrigger] = useState(0);

    // Efecto para cargar zonas frescas y puntos de hidratación
    useEffect(() => {
        const loadData = async () => {
            try {
                const zonas = await zonasService.listarZonas("activa");
                const puntos = await puntosService.obtenerPuntosHidratacion();
                setZonasFrescas(zonas || []);
                setPuntosHidratacion(puntos || []);
            } catch (error) {
                console.error("Error cargando datos del mapa:", error);
            }
        };
        loadData();
    }, []);

    // Estados para datos climáticos
    const [weather, setWeather] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(true);
    const [lastUpdate, setLastUpdate] = useState("—");

    // Efecto para obtener datos climáticos
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const data = await getClima();
                setWeather(data);
                const hora = new Date().toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                });
                setLastUpdate(hora);
            } catch (error) {
                console.error("Error cargando clima:", error);
            } finally {
                setLoadingWeather(false);
            }
        };
        fetchWeather();
    }, []);

    // Preparar estadísticas climáticas para mostrar
    const stats = weather
        ? [
            { id: "heat-level", title: "Nivel de Calor", value: Number(weather.heat_level).toFixed(1), unit: "/100", updated: lastUpdate },
            { id: "temperature", title: "Temperatura", value: weather.temperatura.toFixed(1), unit: "°C", updated: lastUpdate },
            { id: "humidity", title: "Humedad", value: weather.humedad, unit: "%", updated: lastUpdate },
            { id: "hydration", title: "Nivel de Hidratación", value: weather.hydration_level, unit: "/10", updated: lastUpdate },
        ]
        : [
            { id: "heat-level", title: "Nivel de Calor", value: "—", unit: "/100" },
            { id: "temperature", title: "Temperatura", value: "—", unit: "°C" },
            { id: "humidity", title: "Humedad", value: "—", unit: "%" },
            { id: "hydration", title: "Nivel de Hidratación", value: "—", unit: "/10" },
        ];

    // Estados para alertas
    const [alertaActual, setAlertaActual] = useState(null);
    const [loadingAlertas, setLoadingAlertas] = useState(true);
    const [alertaPrevia, setAlertaPrevia] = useState(null); // Para detectar cambios

    // Efecto para cargar alerta actual (sin mostrar notificación automática)
    useEffect(() => {
        const cargarAlerta = async () => {
            try {
                setLoadingAlertas(true);
                const res = await alertasService.obtenerAlertaActual();
                const nuevaAlerta = res.data.data;

                setAlertaActual(nuevaAlerta);
                setAlertaPrevia(nuevaAlerta);
            } catch (err) {
                console.error("Error cargando alerta:", err);
            } finally {
                setLoadingAlertas(false);
            }
        };
        cargarAlerta();
    }, []);

    // Efecto para iniciar monitoreo global de notificaciones
    useEffect(() => {
        // Iniciar monitoreo de notificaciones globales
        notificacionesGlobalesService.startMonitoring();

        // Cleanup al desmontar componente
        return () => {
            notificacionesGlobalesService.stopMonitoring();
        };
    }, []);

    // Efecto para seleccionar consejos aleatorios únicos
    useEffect(() => {
        if (consejosData.length > 1) {
            const indices = [];
            while (indices.length < 2) {
                const randomIndex = Math.floor(Math.random() * consejosData.length);
                if (!indices.includes(randomIndex)) {
                    indices.push(randomIndex);
                }
            }
            const consejosSeleccionados = indices.map(index => consejosData[index]);
            setConsejosAleatorios(consejosSeleccionados);
        }
    }, []);

    // Texto de alerta dinámico
    const alertaTexto = loadingAlertas
        ? "Cargando alertas..."
        : alertaActual
        ? `⚠️ ALERTA ${alertaActual.nivel_riesgo.toUpperCase()} — Temp: ${alertaActual.temperatura}°C, UV: ${alertaActual.indice_uv}, Humedad: ${alertaActual.humedad}%`
        : "No hay alertas activas en este momento.";

    // Handler para seleccionar marcador
    const handleSelectMarker = (marker) => {
        setMarkerSeleccionado(marker);
    };

    // Efecto para obtener ubicación del usuario
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error obteniendo ubicación:", error);
                }
            );
        }
    }, []);

    // Handler para limpiar selección y ruta
    const handleLimpiarSeleccion = () => {
        setRouteCoordinates(null);
        setHighlightedMarker(null);
        setMarkerSeleccionado(null);
        
        // Trigger para resetear la vista del mapa
        setResetViewTrigger(prev => prev + 1);
    };

    // Handler para ir a zona fresca más cercana
    const handleIrZonaFrescaCercana = () => {
        if (!userLocation || zonasFrescas.length === 0) {
            alert("No se pudo obtener tu ubicación o no hay zonas frescas disponibles");
            return;
        }

        const zonaMasCercana = encontrarPuntoMasCercano(userLocation, zonasFrescas);
        
        if (zonaMasCercana) {
            // Trazar ruta
            setRouteCoordinates([
                [userLocation.lat, userLocation.lng],
                [zonaMasCercana.latitud, zonaMasCercana.longitud]
            ]);
            setHighlightedMarker(zonaMasCercana);
            setMarkerSeleccionado(zonaMasCercana);
        }
    };

    // Handler para ir a punto de hidratación más cercano
    const handleIrPuntoHidratacionCercano = () => {
        if (!userLocation || puntosHidratacion.length === 0) {
            alert("No se pudo obtener tu ubicación o no hay puntos de hidratación disponibles");
            return;
        }

        const puntoMasCercano = encontrarPuntoMasCercano(userLocation, puntosHidratacion);
        
        if (puntoMasCercano) {
            // Trazar ruta
            setRouteCoordinates([
                [userLocation.lat, userLocation.lng],
                [puntoMasCercano.latitud, puntoMasCercano.longitud]
            ]);
            setHighlightedMarker(puntoMasCercano);
            setMarkerSeleccionado(puntoMasCercano);
        }
    };

    // Renderizado del componente
    return (
        <div className="hr-container">
            <Navbar />

            <div className="hr-content">
                {/* Sección de alertas del clima */}
                <div className="hr-alerts" role="status" aria-live="polite">
                    <div className={`hr-alerts__inner ${alertaActual ? 'hr-alerts--animated' : ''}`}>
                        {loadingWeather || loadingAlertas ? "Cargando datos..." : alertaTexto}
                    </div>
                </div>

                <div className="hr-grid">
                    {/* Columna izquierda */}
                    <section className="hr-left">
                        <div className="map-preview-card">
                            <div className="map-preview-header">
                                <div>
                                    <h3>🗺️ Cartagena de Indias - COLOMBIA</h3>
                                    <p className="map-location-desc">Se muestran todas las zonas frescas y puntos de hidratación en el mapa.</p>
                                    <div className="map-stats">
                                        <span className="map-stat-item">Zonas Frescas en total: {zonasFrescas.length}</span>
                                        <span className="map-stat-item">Puntos de Hidratacion en total: {puntosHidratacion.length}</span>
                                    </div>
                                </div>
                                <div className="map-legend">
                                    <div className="legend-item">
                                        <span className="legend-color legend-green"></span>
                                        Zonas Frescas
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-color legend-blue"></span>
                                        Puntos de Hidratación
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-color legend-black"></span>
                                        Tu Ubicación
                                    </div>
                                </div>
                            </div>
                            <MapView
                                mini={true}
                                onExpand={() => setOpenMap(true)}
                                zonasFrescas={zonasFrescas}
                                puntosHidratacion={puntosHidratacion}
                                onSelectMarker={handleSelectMarker}
                                resetView={resetViewTrigger}
                                routeCoordinates={routeCoordinates}
                                highlightedMarker={highlightedMarker}
                            />
                            
                            {/* Botones de navegación rápida */}
                            <div className="map-quick-nav">
                                <button 
                                    className="quick-nav-btn btn-zona-fresca"
                                    onClick={handleIrZonaFrescaCercana}
                                    disabled={!userLocation || zonasFrescas.length === 0}
                                >
                                    <span className="btn-icon">🌳</span>
                                    <span className="btn-text">Ver Zona Fresca Más Cercana</span>
                                </button>
                                <button 
                                    className="quick-nav-btn btn-punto-hidratacion"
                                    onClick={handleIrPuntoHidratacionCercano}
                                    disabled={!userLocation || puntosHidratacion.length === 0}
                                >
                                    <span className="btn-icon">💧</span>
                                    <span className="btn-text">Ver Punto de Hidratación Más Cercano</span>
                                </button>
                                <button 
                                    className="quick-nav-btn btn-limpiar"
                                    onClick={handleLimpiarSeleccion}
                                    disabled={!routeCoordinates && !highlightedMarker}
                                >
                                    <span className="btn-icon">🔄</span>
                                    <span className="btn-text">Limpiar Selección</span>
                                </button>
                            </div>
                        </div>
                        <ClimateChart feelsLike={weather?.sensacion_termica} />
                    </section>

                    {/* Columna derecha */}
                    <aside className="hr-right">
                        <div className="hr-stats">
                            {stats.map((s) => (
                                <StatCard key={s.id} title={s.title} value={s.value} unit={s.unit} updated={s.updated} />
                            ))}
                        </div>

                        <IndicatorsPanel
                            uv={weather?.uv_index || 0}
                            feelsLike={weather?.sensacion_termica || 0}
                            risk={weather?.thermal_risk || 0}
                            hydration={weather?.hydration_level || 0}
                        />

                        {consejosAleatorios.map((consejo, index) => (
                            <div key={index} className="consejo-card" onClick={() => navigate('/consejos')} style={{ cursor: 'pointer' }}>
                                <div className="consejo-header">
                                    <h3>
                                        <span style={{ marginRight: '8px' }}>{consejo.icono}</span>
                                        {consejo.titulo}
                                    </h3>
                                </div>
                                <p className="consejo-desc">{consejo.descripcion}</p>
                                <span
                                    className="consejo-tag"
                                    data-categoria={consejo.categoria}
                                >
                                    {consejo.categoria}
                                </span>
                            </div>
                        ))}
                    </aside>
                </div>

                <ReportCallToAction />

            </div>

            {/* Modal de mapa completo - SIN CHILDREN, SOLO PROPS */}
            <MapFullscreenModal 
                open={openMap} 
                onClose={() => setOpenMap(false)}
                zonasFrescas={zonasFrescas}
                puntosHidratacion={puntosHidratacion}
                onSelectMarker={handleSelectMarker}
                zonaSeleccionada={markerSeleccionado?.id_zona ? markerSeleccionado : null}
                puntoSeleccionado={markerSeleccionado?.id_punto ? markerSeleccionado : null}
                resetView={resetViewTrigger}
                routeCoordinates={routeCoordinates}
                highlightedMarker={highlightedMarker}
            />

        </div>
    );
}

// Fin Home.jsx