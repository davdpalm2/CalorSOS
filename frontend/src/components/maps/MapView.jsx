// Inicio MapView.jsx

// frontend/src/components/maps/MapView.jsx

// Componente principal para mostrar mapas interactivos con marcadores

// Importaciones de React y hooks
import React, { useEffect, useRef } from "react";

// Importaciones de React Leaflet
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";

// Importación de Leaflet
import L from "leaflet";

// Importación de estilos
import "./MapView.css";

// Configuración de íconos por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Componente para forzar resize en modal
function ForceResize() {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => map.invalidateSize(), 200);
    }, [map]);
    return null;
}

// Componente para centrar en selección
function CenterOnSelection({ seleccion }) {
    const map = useMap();

    useEffect(() => {
        if (seleccion) {
            map.setView([seleccion.latitud, seleccion.longitud], 16, {
                animate: true,
            });
        }
    }, [seleccion]);

    return null;
}

// Componente para centrar en marcador personalizado
function CenterOnMarker({ markerPosition }) {
    const map = useMap();

    useEffect(() => {
        if (markerPosition) {
            map.setView([markerPosition.lat, markerPosition.lng], 16, {
                animate: true,
            });
        }
    }, [markerPosition]);

    return null;
}

// Componente para reset general de vista
function ResetView({ trigger, zonasFrescas, puntosHidratacion }) {
    const map = useMap();

    useEffect(() => {
        if (trigger === 0) return;

        const coords = [];

        zonasFrescas?.forEach(z => coords.push([z.latitud, z.longitud]));
        puntosHidratacion?.forEach(p => coords.push([p.latitud, p.longitud]));

        if (coords.length === 0) return;

        const bounds = L.latLngBounds(coords);

        map.fitBounds(bounds, {
            padding: [50, 50],
            animate: true,
            maxZoom: 14
        });
    }, [trigger, zonasFrescas]);

    // Escuchar evento de reset
    useEffect(() => {
        const handleReset = () => {
            const coords = [];
            zonasFrescas?.forEach(z => coords.push([z.latitud, z.longitud]));
            puntosHidratacion?.forEach(p => coords.push([p.latitud, p.longitud]));

            if (coords.length === 0) return;

            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, {
                padding: [50, 50],
                animate: true,
                maxZoom: 14
            });
        };

        window.addEventListener('resetMapView', handleReset);
        return () => window.removeEventListener('resetMapView', handleReset);
    }, [map, zonasFrescas, puntosHidratacion]);

    return null;
}

// Ícono verde para zonas frescas
const greenDivIcon = new L.DivIcon({
    html: `<span class="zf-div-marker"></span>`,
    className: "custom-div-icon-wrapper",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -20],
});

// Ícono azul para puntos de hidratación
const blueDivIcon = new L.DivIcon({
    html: `<span class="ph-div-marker"></span>`,
    className: "custom-div-icon-wrapper",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -20],
});

// Ícono rojo para reportes
const redDivIcon = new L.DivIcon({
    html: `<span class="report-div-marker"></span>`,
    className: "custom-div-icon-wrapper",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -20],
});

// Componente funcional principal
export default function MapView({
    mini = false,
    onExpand,
    zonasFrescas = [],
    puntosHidratacion = [],
    zonaSeleccionada = null,
    puntoSeleccionado = null,
    onSelectMarker = () => {},
    resetView = false,
    reportes = [],
    selectedMarker = null,
    markerPosition = null,
    showExpandButton = true,
    touchZoom = true,
}) {
    // Referencias para marcadores
    const markerRefs = useRef({});

    // Abrir popup automático al seleccionar
    useEffect(() => {
        if (zonaSeleccionada && markerRefs.current[zonaSeleccionada.id_zona]) {
            try {
                markerRefs.current[zonaSeleccionada.id_zona].openPopup();
            } catch {}
        }
        if (puntoSeleccionado && markerRefs.current[puntoSeleccionado.id_punto]) {
            try {
                markerRefs.current[puntoSeleccionado.id_punto].openPopup();
            } catch {}
        }
    }, [zonaSeleccionada, puntoSeleccionado]);

    return (
        <div className={mini ? "mv-container mini" : "mv-container full"}>
            <MapContainer
                center={[10.391, -75.479]}
                zoom={13}
                className="mv-map"
                maxBounds={[
                    [10.30, -75.60],
                    [10.50, -75.35]
                ]}
                maxBoundsViscosity={1.0}
                minZoom={12}
                maxZoom={18}
                dragging={true}
                scrollWheelZoom={true}
                doubleClickZoom={!mini}
                zoomControl={false}
                touchZoom={true}
                tap={true}
                boxZoom={!mini}
                keyboard={!mini}
                attributionControl={false}
            >
                <ForceResize />

                {/* Reset general cuando trigger cambia */}
                <ResetView
                    trigger={resetView}
                    zonasFrescas={zonasFrescas}
                    puntosHidratacion={puntosHidratacion}
                />

                {/* Centrado por selección */}
                <CenterOnSelection seleccion={zonaSeleccionada || puntoSeleccionado || (reportes.length > 0 ? reportes[0] : null)} />

                {/* Centrado en marcador personalizado */}
                <CenterOnMarker markerPosition={markerPosition} />

                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                />

                {/* Marcadores verdes para zonas frescas */}
                {Array.isArray(zonasFrescas) && zonasFrescas.map((z) => (
                    <Marker
                        key={z.id_zona}
                        position={[z.latitud, z.longitud]}
                        icon={greenDivIcon}
                        ref={(ref) => (markerRefs.current[z.id_zona] = ref)}
                        eventHandlers={{ click: () => onSelectMarker(z) }}
                    >
                        <Popup>
                            <strong>{z.nombre}</strong><br />
                            <strong> Descripcion: </strong> {z.descripcion}<br />
                            <strong>Estado: </strong>{ z.estado}
                        </Popup>
                    </Marker>
                ))}

                {/* Marcadores azules para puntos de hidratación */}
                {Array.isArray(puntosHidratacion) && puntosHidratacion.map((p) => (
                    <Marker
                        key={p.id_punto}
                        position={[p.latitud, p.longitud]}
                        icon={blueDivIcon}
                        ref={(ref) => (markerRefs.current[p.id_punto] = ref)}
                        eventHandlers={{ click: () => onSelectMarker(p) }}
                    >
                        <Popup>
                            <strong>{p.nombre}</strong><br />
                            <strong> Descripcion: </strong> {p.descripcion}<br />
                            <strong>Estado: </strong>{ p.estado}
                        </Popup>
                    </Marker>
                ))}

                {/* Marcadores rojos para reportes */}
                {Array.isArray(reportes) && reportes.map((r) => (
                    <Marker
                        key={r.id_reporte}
                        position={[r.latitud, r.longitud]}
                        icon={redDivIcon}
                        ref={(ref) => (markerRefs.current[r.id_reporte] = ref)}
                    >
                        <Popup>
                            <strong>Reporte: {r.nombre || "Sin nombre"}</strong><br />
                            <strong>Tipo:</strong> {r.tipo}<br />
                            <strong>Estado:</strong> {r.estado}<br />
                            {r.descripcion && <><strong>Descripción:</strong> {r.descripcion}<br /></>}
                            {r.fecha_reporte && <><strong>Fecha:</strong> {new Date(r.fecha_reporte).toLocaleString()}</>}
                        </Popup>
                    </Marker>
                ))}

                {/* Marcador personalizado para selección en formularios */}
                {markerPosition && (
                    <Marker
                        position={[markerPosition.lat, markerPosition.lng]}
                        draggable={true}
                        eventHandlers={{
                            dragend: (e) => {
                                const newPos = e.target.getLatLng();
                                onSelectMarker({ lat: newPos.lat, lng: newPos.lng });
                            }
                        }}
                    >
                        <Popup>
                            <strong>Ubicación seleccionada</strong><br />
                            Lat: {markerPosition.lat.toFixed(5)}<br />
                            Lng: {markerPosition.lng.toFixed(5)}
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* Botón para ver mapa completo si es mini */}
            {mini && showExpandButton && (
                <button
                    type="button"
                    className="mv-expand-btn"
                    onClick={(e) => { 
                            e.preventDefault(); // Prevenir comportamiento por defecto
                            onExpand && onExpand();
                        }
                    }
                >
                    Ver mapa completo
                </button>
            )}

            {/* Botón para reset vista si no es mini */}
            {!mini && (
                <button
                    type="button"
                    className="mv-reset-btn"
                    onClick={(e) => {
                        e.preventDefault();
                        const event = new CustomEvent('resetMapView');
                        window.dispatchEvent(event);
                    }}
                >
                    Restablecer vista
                </button>
            )}
        </div>
    );
}

// Fin MapView.jsx
