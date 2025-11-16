import React, { useEffect, useState } from "react";
import NavbarSmart from "../components/ui/NavbarSmart.jsx";
import MapView from "../components/maps/MapView.jsx";
import MapFullscreenModal from "../components/maps/MapFullscreenModal.jsx";

import puntosService from "../services/puntosService.js";
import "../assets/styles/PuntosHidratacion.css";

export default function PuntosHidratacion() {

    const [puntos, setPuntos] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [tipoFiltro, setTipoFiltro] = useState("todas");
    const [selectedPunto, setSelectedPunto] = useState(null);

    const [openMap, setOpenMap] = useState(false);

    // Cargar puntos
    useEffect(() => {
        const load = async () => {
            try {
                const data = await puntosService.listarPuntos("activo");
                setPuntos(data);
                setFiltered(data);
            } catch (e) {
                console.error("Error cargando puntos", e);
            }
        };
        load();
    }, []);

    // Filtrado dinámico
    useEffect(() => {
        let r = puntos;

        if (search.trim() !== "") {
            r = r.filter((p) =>
                p.nombre.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (tipoFiltro !== "todas") {
            r = r.filter((p) => p.fuente === tipoFiltro);
        }

        setFiltered(r);
    }, [search, tipoFiltro, puntos]);

    return (
        <div className="ph-page">
            <NavbarSmart />

            <h1 className="ph-title">Puntos de Hidratación</h1>

            <div className="ph-layout">

                {/* SIDEBAR */}
                <aside className="ph-sidebar">

                    <input
                        type="search"
                        className="ph-search"
                        placeholder="Buscar punto..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        className="ph-select"
                        value={tipoFiltro}
                        onChange={(e) => setTipoFiltro(e.target.value)}
                    >
                        <option value="todas">Todos</option>
                        <option value="reporte ciudadano">Reporte ciudadano</option>
                        <option value="oficial">Oficial</option>
                    </select>

                    <div className="ph-list">
                        {filtered.length === 0 ? (
                            <p className="ph-empty">No se encontraron puntos.</p>
                        ) : (
                            filtered.map((p) => (
                                <div
                                    key={p.id_punto}
                                    className={`ph-item ${
                                        selectedPunto?.id_punto === p.id_punto ? "selected" : ""
                                    }`}
                                    onClick={() => setSelectedPunto(p)}
                                >
                                    <h4>{p.nombre}</h4>
                                    <p>{p.direccion}</p>
                                    <span className="ph-tag">{p.fuente}</span>
                                </div>
                            ))
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
                        />
                    </div>
                </main>

            </div>

            {/* Modal Fullscreen */}
            <MapFullscreenModal open={openMap} onClose={() => setOpenMap(false)}>
                <MapView
                    mini={false}
                    puntosHidratacion={filtered}
                    puntoSeleccionado={selectedPunto}
                    onSelectMarker={setSelectedPunto}
                />
            </MapFullscreenModal>
        </div>
    );
}
