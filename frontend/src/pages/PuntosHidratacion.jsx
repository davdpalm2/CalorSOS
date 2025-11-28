// inicio PuntosHidratacion.jsx

// frontend/src/pages/PuntosHidratacion.jsx

// Importaciones de React y hooks
import React, { useEffect, useState } from "react";

// Importaciones de componentes
import NavbarSmart from "../components/ui/NavbarSmart.jsx";
import MapView from "../components/maps/MapView.jsx";
import MapFullscreenModal from "../components/maps/MapFullscreenModal.jsx";
import LoaderPremium from "../components/common/LoaderPremium.jsx";

// Importaciones de servicios
import puntosService from "../services/puntosService.js";
import { crearReporte } from "../services/reportesService.js";

// Importaciones de estilos
import "../assets/styles/PuntosHidratacion.css";

// Componente principal para la página de puntos de hidratación
export default function PuntosHidratacion() {
    // Estados para manejo de puntos
    const [puntos, setPuntos] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedPunto, setSelectedPunto] = useState(null);

    // Estado para controlar apertura del mapa completo
    const [openMap, setOpenMap] = useState(false);

    // Estados para el modal de reporte
    const [reportOpen, setReportOpen] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportResult, setReportResult] = useState(null);
    const [reportData, setReportData] = useState({
        tipo: "hidratacion",
        nombre: "",
        descripcion: "",
        latitud: "",
        longitud: "",
        tipo_zona_fresca: null,
    });



    // Estado para el marcador del mapa
    const [mapMarker, setMapMarker] = useState(null);

    // Efecto para cargar puntos de hidratación activos
    useEffect(() => {
        const load = async () => {
            try {
                const data = await puntosService.obtenerPuntosHidratacion("activa");
                setPuntos(data);
                setFiltered(data);
            } catch (e) {
                console.error("Error cargando puntos", e);
            }
        };
        load();
    }, []);

    // Efecto para filtrado dinámico por nombre
    useEffect(() => {
        let resultado = puntos;

        if (search.trim() !== "") {
            resultado = resultado.filter((p) =>
                p.nombre.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFiltered(resultado);
    }, [search, puntos]);

    // Calcular total de puntos
    const totalPuntos = puntos.length;

    // Función para abrir modal de reporte con geolocalización
    const handleOpenReport = async () => {
        setReportResult(null);
        setLoadingReportInit(true);

        // Resetear datos del reporte
        setReportData({
            tipo: "hidratacion",
            nombre: "",
            descripcion: "",
            latitud: "",
            longitud: "",
            tipo_zona_fresca: null,
        });

        // Obtener ubicación actual
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    };
                    setReportData(prev => ({
                        ...prev,
                        latitud: coords.lat,
                        longitud: coords.lng,
                    }));
                    setMapMarker(coords);
                    setLoadingReportInit(false);
                    setReportOpen(true);
                },
                () => {
                    setLoadingReportInit(false);
                    setReportOpen(true);
                },
                { enableHighAccuracy: true, timeout: 8000 }
            );
        } else {
            setLoadingReportInit(false);
            setReportOpen(true);
        }
    };

    // Función para enviar reporte
    const submitReport = async (e) => {
        e.preventDefault();
        setReportLoading(true);
        setReportResult(null);

        try {
            await crearReporte(reportData);
            setReportResult({ success: true, message: "El reporte ya fue realizado. Gracias." });
            setTimeout(() => setReportOpen(false), 2000);
        } catch (err) {
            setReportResult({ success: false, message: err.message });
        } finally {
            setReportLoading(false);
        }
    };

    // Función para renderizar cada punto en la lista
    const renderCompactItem = (p) => (
        <div
            key={p.id_punto}
            className={`ph-item-compact ${selectedPunto?.id_punto === p.id_punto ? "selected" : ""}`}
            onClick={() => setSelectedPunto(p)}
        >
            <strong className="ph-item-name">{p.nombre}</strong>
        </div>
    );

    // Estado para señal de reinicio de vista del mapa
    const [resetViewSignal, setResetViewSignal] = useState(0);

    // Estado para loader inicial de reporte
    const [loadingReportInit, setLoadingReportInit] = useState(false);

    // Renderizado del componente
    return (
        <div className="ph-page">
            <NavbarSmart />

            <h1 className="ph-title">Puntos de Hidratación en Cartagena</h1>

            <div className="ph-layout">

                {/* Barra lateral izquierda */}
                <aside className="ph-sidebar">
                    <div className="ph-sidebar-header">
                        <input
                            type="search"
                            className="ph-search"
                            placeholder="Buscar punto..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {/* Botón para borrar selección */}
                        {selectedPunto && (
                            <button
                                className="ph-clear-btn"
                                onClick={() => {
                                    setSelectedPunto(null);
                                    setResetViewSignal(prev => prev + 1);
                                }}
                            >
                                Borrar selección
                            </button>
                        )}
                    </div>

                    <div className="ph-list-compact">
                        {filtered.length === 0 ? (
                            <p className="ph-empty">No se encontraron puntos.</p>
                        ) : (
                            filtered.map(renderCompactItem)
                        )}
                    </div>
                </aside>

                {/* Área principal del mapa */}
                <main className="ph-map-area">
                    <div className="ph-map-card">
                        <MapView
                            mini
                            puntosHidratacion={filtered}
                            puntoSeleccionado={selectedPunto}
                            onSelectMarker={setSelectedPunto}
                            onExpand={() => setOpenMap(true)}
                            resetView={resetViewSignal}
                        />
                    </div>

                    {/* Sección para reportar nuevo punto */}
                    <div className="ph-report-bar">
                        <h3>¿Deseas reportar un nuevo punto de hidratación?</h3>
                        <p>Utilizaremos tu ubicación actual para facilitar el proceso.</p>

                        <button
                            className="btn-reportar-punto"
                            onClick={handleOpenReport}
                        >
                            Reportar nuevo punto de hidratación
                        </button>
                    </div>
                </main>

                {/* Barra lateral derecha con detalles */}
                <aside className="ph-right-sidebar">
                    <div className="ph-stats">
                        <h3>Estadísticas</h3>
                        <p>Total puntos: <strong>{totalPuntos}</strong></p>
                    </div>

                    <div className="ph-selected-details">
                        <h3>Punto seleccionado</h3>
                        {selectedPunto ? (
                            <>
                                <p><strong>{selectedPunto.nombre}</strong></p>
                                <p>{selectedPunto.descripcion}</p>
                                <p>Estado: {selectedPunto.estado}</p>
                            </>
                        ) : (
                            <p>No has seleccionado ningún punto.</p>
                        )}
                    </div>
                </aside>
            </div>

            {/* Modal de mapa en pantalla completa */}
            <MapFullscreenModal open={openMap} onClose={() => setOpenMap(false)}>
                <MapView
                    mini={false}
                    puntosHidratacion={filtered}
                    puntoSeleccionado={selectedPunto}
                    onSelectMarker={setSelectedPunto}
                />
            </MapFullscreenModal>

            {/* Modal de reporte */}
            {reportOpen && (
                <div className="ph-report-backdrop">
                    <div className="ph-report-modal">
                        <button className="ph-report-close" onClick={() => setReportOpen(false)}>
                            X
                        </button>
                        <h3>Reportar Punto de Hidratación</h3>

                        <form onSubmit={submitReport} className="ph-report-form">

                            <label>
                                Tipo de reporte
                                <input value="Punto de Hidratacion" readOnly />
                            </label>

                            <label>
                                Nombre (opcional)
                                <input
                                    value={reportData.nombre}
                                    onChange={(e) =>
                                        setReportData(prev => ({ ...prev, nombre: e.target.value }))
                                    }
                                />
                            </label>

                            <label>
                                Descripción
                                <textarea
                                    value={reportData.descripcion}
                                    onChange={(e) =>
                                        setReportData(prev => ({ ...prev, descripcion: e.target.value }))
                                    }
                                />
                            </label>

                            {/* Mapa interactivo para seleccionar ubicación */}
                            <div className="ph-map-selector">
                                <p>Selecciona la ubicación en el mapa:</p>
                                <strong><h6> (Mueva el marcador para seleccionar el punto de hidratacion)</h6></strong>
                                <MapView
                                    mini={true}
                                    onSelectMarker={(coords) => {
                                        setMapMarker(coords);
                                        setReportData(prev => ({
                                            ...prev,
                                            latitud: coords.lat,
                                            longitud: coords.lng,
                                        }));
                                    }}
                                    puntosHidratacion={[]}
                                    zonasFrescas={[]}
                                    markerPosition={mapMarker}
                                    showExpandButton={false}
                                />
                            </div>

                            <div className="ph-report-actions">
                                <button type="submit" className="btn-report-submit" disabled={reportLoading}>
                                    {reportLoading ? "Enviando..." : "Enviar reporte"}
                                </button>
                                <button type="button" className="btn-cancel" onClick={() => setReportOpen(false)}>
                                    Cancelar
                                </button>
                            </div>

                            {reportResult && (
                                <p className={`ph-report-result ${reportResult.success ? "ok" : "err"}`}>
                                    {reportResult.message}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* Overlay de loader para geolocalización */}
            {loadingReportInit && (
                <div className="ph-loader-screen">
                    <LoaderPremium mini={false} />
                    <p className="ph-loader-text">Obteniendo ubicación...</p>
                </div>
            )}
        </div>
    );
}

// Fin PuntosHidratacion.jsx
