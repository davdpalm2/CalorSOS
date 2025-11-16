// src/pages/Home.jsx
import React, { useState, useEffect } from "react";

// UI components
import IndicatorsPanel from "../components/ui/IndicatorsPanel.jsx";
import Navbar from "../components/ui/NavbarSmart.jsx";
import ReportCallToAction from "../components/ui/ReportCTA.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import ClimateChart from "../components/ui/ClimateChart.jsx";

// Map components
import MapView from "../components/maps/MapView.jsx";
import MapFullscreenModal from "../components/maps/MapFullscreenModal.jsx";

// Report Modal
import ReportModal from "../components/report/ReportModal.jsx";

// Services
import { getClima } from "../services/climaService.js";
import zonasService from "../services/zonasService.js";
import puntosService from "../services/puntosService.js";
import { crearReporte } from "../services/reportesService.js";

// Styles
import "../assets/styles/Home.css";

export default function Home() {
    const [openMap, setOpenMap] = useState(false);

    // 👉 Datos del backend
    const [zonasFrescas, setZonasFrescas] = useState([]);
    const [puntosHidratacion, setPuntosHidratacion] = useState([]);

    // 👉 Modal de reporte
    const [openReportModal, setOpenReportModal] = useState(false);

    // 👉 Formulario
    const [formTipo, setFormTipo] = useState("");
    const [formNombre, setFormNombre] = useState("");
    const [formDescripcion, setFormDescripcion] = useState("");
    const [formLatitud, setFormLatitud] = useState(null);
    const [formLongitud, setFormLongitud] = useState(null);
    const [formTipoZonaFresca, setFormTipoZonaFresca] = useState("");

    const handleMapClick = (e) => {
        setFormLatitud(e.latlng.lat);
        setFormLongitud(e.latlng.lng);
    };

    // 👉 Cargar ZONAS y PUNTOS PARA EL MAPA
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

    // 👉 Clima
    const [weather, setWeather] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(true);
    const [lastUpdate, setLastUpdate] = useState("—");

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

    // Alertas inteligentes
    let alertaTexto = "No hay alertas activas en este momento.";


    // 👉 Obtener ubicación automáticamente al abrir modal
    useEffect(() => {
        if (!openReportModal) return;

        if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
            setFormLatitud(position.coords.latitude);
            setFormLongitud(position.coords.longitude);
            },
            (error) => {
            console.error("Error obteniendo ubicación:", error);
            alert("No se pudo obtener tu ubicación. Por favor, permite el acceso.");
            }
        );
        } else {
        alert("Tu navegador no soporta geolocalización.");
        }
    }, [openReportModal]);

    const resetForm = () => {
        setFormTipo("");
        setFormNombre("");
        setFormDescripcion("");
        setFormLatitud(null);
        setFormLongitud(null);
        setFormTipoZonaFresca("");
    };

    return (
        <div className="hr-container">
        <Navbar />

        <div className="hr-content">
            {/* ALERTAS DEL CLIMA */}
            <div className="hr-alerts" role="status" aria-live="polite">
            <div className="hr-alerts__inner">{loadingWeather ? "Cargando datos del clima…" : alertaTexto}</div>
            </div>

            <div className="hr-grid">
            {/* LEFT COLUMN */}
            <section className="hr-left">
                <div className="map-preview-card">
                <div className="map-preview-header">
                    <div>
                    <h3>🗺️ Cartagena</h3>
                    <p className="map-location-desc">Zonas frescas y puntos de hidratación</p>
                    </div>
                </div>
                <MapView
                    mini={true}
                    onExpand={() => setOpenMap(true)}
                    zonasFrescas={zonasFrescas}
                    puntosHidratacion={puntosHidratacion}
                />
                </div>
                <ClimateChart feelsLike={weather?.sensacion_termica} />
            </section>

            {/* RIGHT COLUMN */}
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
            </aside>
            </div>

            <ReportCallToAction onClick={() => setOpenReportModal(true)} />
        </div>

        {/* Modal de mapa completo */}
        <MapFullscreenModal open={openMap} onClose={() => setOpenMap(false)}>
            <MapView mini={false} zonasFrescas={zonasFrescas} puntosHidratacion={puntosHidratacion} />
        </MapFullscreenModal>

        {/* Modal de reporte */}
        <ReportModal open={openReportModal} onClose={() => setOpenReportModal(false)}>
            <h2 className="rm-title">Nuevo reporte comunitario</h2>

            <div className="rm-form">
            {/* Tipo obligatorio */}
            <label className="rm-label">Tipo de reporte <span style={{ color: "#ff6f31" }}>*</span></label>
            <select
                className={`rm-input ${formTipo === "zona_fresca" ? "rm-select-orange" : formTipo === "hidratacion" ? "rm-select-blue" : ""}`}
                value={formTipo}
                onChange={(e) => setFormTipo(e.target.value)}
            >
                <option value="">Selecciona…</option>
                <option value="zona_fresca">Zona fresca</option>
                <option value="hidratacion">Punto de hidratación</option>
            </select>

            {/* Nombre */}
            <label className="rm-label">Nombre del punto o zona</label>
            <input
                type="text"
                className="rm-input"
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                placeholder="Ej: Fuente de agua / Árbol grande"
            />

            {/* Descripción */}
            <label className="rm-label">Descripción (opcional)</label>
            <textarea
                className="rm-textarea"
                placeholder="Ej: Árbol en buen estado, sombra agradable…"
                value={formDescripcion}
                onChange={(e) => setFormDescripcion(e.target.value)}
            ></textarea>

            {/* Tipo de zona fresca (si aplica) */}
            {formTipo === "zona_fresca" && (
                <>
                    <label className="rm-label">Tipo de zona fresca *</label>
                    <select
                        className="rm-input"
                        value={formTipoZonaFresca}
                        onChange={(e) => setFormTipoZonaFresca(e.target.value)}
                    >
                        <option value="">Seleccione...</option>
                        <option value="urbana">Urbana</option>
                        <option value="natural">Natural</option>
                        <option value="artificial">Artificial</option>
                    </select>
                </>
            )}

            {/* Coordenadas */}
            <label className="rm-label">Ubicación detectada</label>
            <div className="rm-coords">
                {formLatitud && formLongitud
                ? `${formLatitud.toFixed(6)}, ${formLongitud.toFixed(6)}`
                : "Obteniendo ubicación…"}
            </div>
            </div>

            <div className="rm-actions">
            <button
                className="rm-btn-cancel"
                onClick={() => {
                setOpenReportModal(false);
                resetForm();
                }}
            >
                Cancelar
            </button>

            <button
                className="rm-btn-send"
                disabled={!formTipo || !formLatitud || (formTipo === "zona_fresca" && !formTipoZonaFresca)}
                onClick={async () => {
                    const reporte = {
                        tipo: formTipo,
                        nombre: formNombre,
                        descripcion: formDescripcion,
                        latitud: formLatitud,
                        longitud: formLongitud,
                        tipo_zona_fresca: formTipo === "zona_fresca" ? formTipoZonaFresca : null
                    };

                    try {
                        const res = await crearReporte(reporte); // form data enviado
                        console.log("Reporte enviado:", res);
                        alert("Reporte enviado correctamente");

                        setOpenReportModal(false);
                        resetForm();
                    } catch (error) {
                        alert("Ocurrió un error al enviar el reporte.");
                        console.error(error);
                    }
                }}
            >
                Enviar reporte
            </button>
            </div>
        </ReportModal>
        </div>
    );
}
