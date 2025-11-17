import React, { useEffect, useState } from "react";
import NavbarSmart from "../components/ui/NavbarSmart.jsx";
import MapView from "../components/maps/MapView.jsx";
import MapFullscreenModal from "../components/maps/MapFullscreenModal.jsx";
import LoaderPremium from "../components/common/LoaderPremium.jsx";

import puntosService from "../services/puntosService.js";
import { crearReporte } from "../services/reportesService.js";
import "../assets/styles/PuntosHidratacion.css";

export default function PuntosHidratacion() {
    const [puntos, setPuntos] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedPunto, setSelectedPunto] = useState(null);

    const [openMap, setOpenMap] = useState(false);

    // Report modal
    const [reportOpen, setReportOpen] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportResult, setReportResult] = useState(null);
    const [reportData, setReportData] = useState({
        tipo: "zona_fresca",
        nombre: "",
        descripcion: "",
        latitud: "",
        longitud: "",
    });

    // Cargar puntos - solo activos para usuarios normales
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

    // Filtrado dinámico por nombre
    useEffect(() => {
        let resultado = puntos;

        if (search.trim() !== "") {
            resultado = resultado.filter((p) =>
                p.nombre.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFiltered(resultado);
    }, [search, puntos]);

    const totalPuntos = puntos.length;

    // Abrir modal de reporte + geolocalización
    const handleOpenReport = async () => {
        setReportResult(null);
        setLoadingReportInit(true);  // ← Mostrar loader antes de abrir el modal

        setReportData({
            tipo: "hidratacion",
            nombre: "",
            descripcion: "",
            latitud: "",
            longitud: "",
        });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setReportData(prev => ({
                        ...prev,
                        latitud: pos.coords.latitude,
                        longitud: pos.coords.longitude,
                    }));
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


    const submitReport = async (e) => {
        e.preventDefault();
        setReportLoading(true);
        setReportResult(null);

        try {
            await crearReporte(reportData);
            setReportResult({ success: true, message: "El reporte ya fue realizado. Gracias." });
            setTimeout(() => setReportOpen(false), 2000); // Cerrar modal después de 2 segundos para que el usuario vea el mensaje
        } catch (err) {
            setReportResult({ success: false, message: err.message });
        } finally {
            setReportLoading(false);
        }
    };

    // Render de cada punto
    const renderCompactItem = (p) => (
        <div
            key={p.id_punto}
            className={`ph-item-compact ${selectedPunto?.id_punto === p.id_punto ? "selected" : ""}`}
            onClick={() => setSelectedPunto(p)}
        >
            <strong className="ph-item-name">{p.nombre}</strong>
        </div>
    );

    const [resetViewSignal, setResetViewSignal] = useState(0);

    const [loadingReportInit, setLoadingReportInit] = useState(false);

    return (
        <div className="ph-page">
            <NavbarSmart />

            <h1 className="ph-title">Puntos de Hidratación en Cartagena</h1>

            <div className="ph-layout">

                {/* LEFT SIDEBAR */}
                <aside className="ph-sidebar">
                    <div className="ph-sidebar-header">
                        <input
                            type="search"
                            className="ph-search"
                            placeholder="Buscar punto..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {/* NUEVO: botón borrar selección */}
                        {selectedPunto && (
                            <button
                                className="ph-clear-btn"
                                onClick={() => {
                                    setSelectedPunto(null);
                                    setResetViewSignal(prev => prev + 1); // activa el reinicio del mapa
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

                {/* MAPA */}
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

                    {/* NUEVA SECCIÓN BAJO EL MAPA */}
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

                {/* RIGHT SIDEBAR - Solo detalles */}
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

            {/* MODAL MAPA FULLSCREEN */}
            <MapFullscreenModal open={openMap} onClose={() => setOpenMap(false)}>
                <MapView
                    mini={false}
                    puntosHidratacion={filtered}
                    puntoSeleccionado={selectedPunto}
                    onSelectMarker={setSelectedPunto}
                />
            </MapFullscreenModal>

            {/* MODAL REPORTE */}
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

                            <label>
                                Latitud
                                <input
                                    value={reportData.latitud || ""}
                                    onChange={(e) =>
                                        setReportData(prev => ({ ...prev, latitud: e.target.value }))
                                    }
                                />
                            </label>

                            <label>
                                Longitud
                                <input
                                    value={reportData.longitud || ""}
                                    onChange={(e) =>
                                        setReportData(prev => ({ ...prev, longitud: e.target.value }))
                                    }
                                />
                            </label>

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

            {/* LOADER OVERLAY PARA GEOLOCALIZACIÓN */}
            {loadingReportInit && (
                <div className="ph-loader-screen">
                    <LoaderPremium mini={false} />
                    <p className="ph-loader-text">Obteniendo ubicación...</p>
                </div>
            )}
        </div>
    );
}
