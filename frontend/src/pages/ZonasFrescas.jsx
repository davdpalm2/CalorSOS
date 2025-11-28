// Inicio ZonasFrescas.jsx

// frontend/src/pages/ZonasFrescas.jsx

// Página para mostrar y gestionar zonas frescas

// Importaciones de React y hooks
import React, { useEffect, useState } from "react";

// Importación de componentes
import NavbarSmart from "../components/ui/NavbarSmart.jsx";
import MapView from "../components/maps/MapView.jsx";
import MapFullscreenModal from "../components/maps/MapFullscreenModal.jsx";
import LoaderPremium from "../components/common/LoaderPremium.jsx";

// Importación de servicios
import zonasService from "../services/zonasService.js";
import { crearReporte } from "../services/reportesService.js";

// Importación de estilos
import "../assets/styles/ZonasFrescas.css";

export default function ZonasFrescas() {
    const [zonas, setZonas] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [tipoFiltro, setTipoFiltro] = useState("todas");
    const [selectedZona, setSelectedZona] = useState(null);

    const [openMap, setOpenMap] = useState(false);

    // Estados para el modal de reporte
    const [reportOpen, setReportOpen] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportResult, setReportResult] = useState(null);
    const [reportData, setReportData] = useState({
        tipo: "zona_fresca",
        nombre: "",
        descripcion: "",
        latitud: "",
        longitud: "",
        tipo_zona_fresca: "",
    });

    // Estado para el marcador del mapa
    const [mapMarker, setMapMarker] = useState(null);

    // Estado para loader de inicialización de reporte
    const [loadingReportInit, setLoadingReportInit] = useState(false);

    // Estado para resetear vista del mapa
    const [resetViewSignal, setResetViewSignal] = useState(0);

    // Cargar zonas al montar el componente
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

    // Filtrado dinámico basado en búsqueda y tipo
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

    // Calcular estadísticas
    const totalZonas = zonas.length;
    const countByType = (t) => zonas.filter(z => z.tipo === t).length;

    // Abrir modal de reporte con geolocalización
    const handleOpenReport = async () => {
        setReportResult(null);
        setLoadingReportInit(true);

        setReportData({
        tipo: "zona_fresca",
        nombre: "",
        descripcion: "",
        latitud: "",
        longitud: "",
        tipo_zona_fresca: "",
        });

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

    // Enviar reporte
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

    // Renderizar item compacto de zona
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

    return (
        <div className="zf-page">
        <NavbarSmart />

        <h1 className="zf-title">Zonas Frescas en Cartagena</h1>

        <div className="zf-layout">

            {/* Barra lateral izquierda */}
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
                        <option value="natural">Natural</option>
                        <option value="artificial">Artificial</option>
                    </select>

                    {/* Botón para borrar selección */}
                    {selectedZona && (
                    <button
                        className="zf-clear-btn"
                        onClick={() => {
                        setSelectedZona(null);
                        setResetViewSignal(prev => prev + 1);
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

            {/* Área del mapa */}
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

            {/* Sección para reportar nueva zona */}
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

            {/* Barra lateral derecha */}
            <aside className="zf-right-sidebar">
            <div className="zf-stats">
                <h3>Estadísticas</h3>
                <p>Total zonas: <strong>{totalZonas}</strong></p>
                <p>Urbanas: {countByType("urbana")}</p>
                <p>Naturales: {countByType("natural")}</p>
                <p>Artificiales: {countByType("artificial")}</p>
            </div>

            <div className="zf-selected-details">
                <h3>Zona seleccionada</h3>
                {selectedZona ? (
                <>
                    <p><strong>{selectedZona.nombre}</strong></p>
                    <p>{selectedZona.descripcion}</p>
                    <p>Tipo: <span className="zf-tag-inline">{selectedZona.tipo}</span></p>
                    <p>Estado: {selectedZona.estado || "No disponible"}</p>
                </>
                ) : (
                <p>No has seleccionado ninguna zona.</p>
                )}
            </div>
            </aside>
        </div>

        {/* Modal de mapa en pantalla completa */}
        <MapFullscreenModal open={openMap} onClose={() => setOpenMap(false)}>
            <MapView
                mini={false}
                zonasFrescas={filtered}
                zonaSeleccionada={selectedZona}
                onSelectMarker={setSelectedZona}
            />
        </MapFullscreenModal>

        {/* Modal de reporte */}
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
                    <input value="Zonas Frescas" readOnly />
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

                {reportData.tipo === "zona_fresca" && (
                    <label>
                    Tipo de zona fresca
                    <select
                        value={reportData.tipo_zona_fresca || ""}
                        onChange={(e) =>
                        setReportData(prev => ({ ...prev, tipo_zona_fresca: e.target.value }) )
                        }
                    >
                        <option value="">Seleccione...</option>
                        <option value="urbana">Urbana</option>
                        <option value="natural">Natural</option>
                        <option value="artificial">Artificial</option>
                    </select>
                    </label>
                )}

                {/* Mapa interactivo para seleccionar ubicación */}
                <div className="zf-map-selector">
                    <p>Selecciona la ubicación en el mapa:</p>
                    <strong> <h6> (Mueva el marcador para seleccionar la zona fresca)</h6> </strong>
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
                        zonasFrescas={[]}
                        puntosHidratacion={[]}
                        markerPosition={mapMarker}
                        showExpandButton={false}
                    />
                </div>

                <div className="zf-report-actions">
                    <button
                    type="submit"
                    className="btn-report-submit"
                    disabled={reportLoading || (reportData.tipo === "zona_fresca" && !reportData.tipo_zona_fresca)}
                    >
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

        {/* Loader para geolocalización */}
        {loadingReportInit && (
            <div className="zf-loader-screen">
            <LoaderPremium mini={false} />
            <p className="zf-loader-text">Obteniendo ubicación...</p>
            </div>
        )}
        </div>
    );
}

// Fin ZonasFrescas.jsx
