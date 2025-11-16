// frontend/src/pages/ZonasFrescas.jsx
import React, { useEffect, useState } from "react";
import NavbarSmart from "../components/ui/NavbarSmart.jsx";
import MapView from "../components/maps/MapView.jsx";
import MapFullscreenModal from "../components/maps/MapFullscreenModal.jsx";
import LoaderPremium from "../components/common/LoaderPremium.jsx";

import zonasService from "../services/zonasService.js";
import { crearReporte } from "../services/reportesService.js";
import "../assets/styles/ZonasFrescas.css";

export default function ZonasFrescas() {
    const [zonas, setZonas] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [tipoFiltro, setTipoFiltro] = useState("todas");
    const [selectedZona, setSelectedZona] = useState(null);

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

    // Cargar zonas
    useEffect(() => {
        const load = async () => {
            try {
                const data = await zonasService.listarZonas("activa");
                setZonas(data);
                setFiltered(data);
            } catch (e) {
                console.error("Error cargando zonas frescas", e);
            }
        };
        load();
    }, []);

    // Filtrado dinámico
    useEffect(() => {
        let resultado = zonas;

        if (search.trim() !== "") {
            resultado = resultado.filter((z) =>
                z.nombre.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (tipoFiltro !== "todas") {
            resultado = resultado.filter((z) => z.tipo === tipoFiltro);
        }

        setFiltered(resultado);
    }, [search, tipoFiltro, zonas]);

    const totalZonas = zonas.length;
    const countByType = (t) => zonas.filter(z => z.tipo === t).length;

    // Abrir modal de reporte + geolocalización
    const handleOpenReport = async () => {
        setReportResult(null);
        setLoadingReportInit(true);  // ← Mostrar loader antes de abrir el modal

        setReportData({
            tipo: "zona_fresca",
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

    // Render de cada zona
    const renderCompactItem = (z) => (
        <div
            key={z.id_zona}
            className={`zf-item-compact ${selectedZona?.id_zona === z.id_zona ? "selected" : ""}`}
            onClick={() => setSelectedZona(z)}
        >
            <strong className="zf-item-name">{z.nombre}</strong>
            <span className="zf-item-type">{z.tipo}</span>
        </div>
    );

    const [resetViewSignal, setResetViewSignal] = useState(0);

    const [loadingReportInit, setLoadingReportInit] = useState(false);

    return (
        <div className="zf-page">
            <NavbarSmart />

            <h1 className="zf-title">Zonas Frescas en Cartagena</h1>

            <div className="zf-layout">

                {/* LEFT SIDEBAR */}
                <aside className="zf-sidebar">
                    <div className="zf-sidebar-header">
                        <input
                            type="search"
                            className="zf-search"
                            placeholder="Buscar zona..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <select
                            className="zf-select"
                            value={tipoFiltro}
                            onChange={(e) => setTipoFiltro(e.target.value)}
                        >
                            <option value="todas">Todas</option>
                            <option value="urbana">Urbana</option>
                            <option value="rural">Rural</option>
                            <option value="artificial">Artificial</option>
                        </select>

                        {/* NUEVO: botón borrar selección */}
                        {selectedZona && (
                            <button
                                className="zf-clear-btn"
                                onClick={() => {
                                    setSelectedZona(null);
                                    setResetViewSignal(prev => prev + 1); // activa el reinicio del mapa
                                }}
                            >
                                Borrar selección
                            </button>
                        )}
                    </div>

                    <div className="zf-list-compact">
                        {filtered.length === 0 ? (
                            <p className="zf-empty">No se encontraron zonas.</p>
                        ) : (
                            filtered.map(renderCompactItem)
                        )}
                    </div>
                </aside>

                {/* MAPA */}
                <main className="zf-map-area">
                    <div className="zf-map-card">
                        <MapView
                            mini
                            zonasFrescas={filtered}
                            zonaSeleccionada={selectedZona}
                            onSelectMarker={setSelectedZona}
                            onExpand={() => setOpenMap(true)}
                            resetView={resetViewSignal}
                        />
                    </div>

                    {/* NUEVA SECCIÓN BAJO EL MAPA */}
                    <div className="zf-report-bar">
                        <h3>¿Deseas reportar una nueva zona fresca?</h3>
                        <p>Utilizaremos tu ubicación actual para facilitar el proceso.</p>

                        <button
                            className="btn-reportar-zona"
                            onClick={handleOpenReport}
                        >
                            Reportar nueva zona fresca
                        </button>
                    </div>
                </main>

                {/* RIGHT SIDEBAR - Solo detalles y estadísticas */}
                <aside className="zf-right-sidebar">
                    <div className="zf-stats">
                        <h3>Estadísticas</h3>
                        <p>Total zonas: <strong>{totalZonas}</strong></p>
                        <p>Urbanas: {countByType("urbana")}</p>
                        <p>Rurales: {countByType("rural")}</p>
                        <p>Artificiales: {countByType("artificial")}</p>
                    </div>

                    <div className="zf-selected-details">
                        <h3>Zona seleccionada</h3>
                        {selectedZona ? (
                            <>
                                <p><strong>{selectedZona.nombre}</strong></p>
                                <p>{selectedZona.descripcion}</p>
                                <p>Tipo: <span className="zf-tag-inline">{selectedZona.tipo}</span></p>
                            </>
                        ) : (
                            <p>No has seleccionado ninguna zona.</p>
                        )}
                    </div>
                </aside>
            </div>

            {/* MODAL MAPA FULLSCREEN */}
            <MapFullscreenModal open={openMap} onClose={() => setOpenMap(false)}>
                <MapView
                    mini={false}
                    zonasFrescas={filtered}
                    zonaSeleccionada={selectedZona}
                    onSelectMarker={setSelectedZona}
                />
            </MapFullscreenModal>

            {/* MODAL REPORTE */}
            {reportOpen && (
                <div className="zf-report-backdrop">
                    <div className="zf-report-modal">
                        <button className="zf-report-close" onClick={() => setReportOpen(false)}>
                            X
                        </button>
                        <h3>Reportar Zona Fresca</h3>

                        <form onSubmit={submitReport} className="zf-report-form">

                            <label>
                                Tipo de reporte
                                <input value="zona_fresca" readOnly />
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

                            <div className="zf-report-actions">
                                <button type="submit" className="btn-report-submit" disabled={reportLoading}>
                                    {reportLoading ? "Enviando..." : "Enviar reporte"}
                                </button>
                                <button type="button" className="btn-cancel" onClick={() => setReportOpen(false)}>
                                    Cancelar
                                </button>
                            </div>

                            {reportResult && (
                                <p className={`zf-report-result ${reportResult.success ? "ok" : "err"}`}>
                                    {reportResult.message}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* LOADER OVERLAY PARA GEOLOCALIZACIÓN */}
            {loadingReportInit && (
                <div className="zf-loader-screen">
                    <LoaderPremium mini={false} />
                    <p className="zf-loader-text">Obteniendo ubicación...</p>
                </div>
            )}
        </div>
    );
}
