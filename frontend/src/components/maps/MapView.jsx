// frontend/src/components/maps/MapView.jsx

// Componente principal para mostrar mapas interactivos con marcadores

// Importaciones de React y hooks
import React, { useEffect, useRef, useState } from "react";

// Importaciones de React Leaflet
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap,
} from "react-leaflet";

// Importación de Leaflet
import L from "leaflet";

// Importación de estilos
import "./MapView.css";

// Importación de utilidades de distancia
import { calcularDistancia, formatearDistancia } from "../../utils/distanceUtils";

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

// Componente para centrar y hacer zoom en ruta
function FitRouteBounds({ routeCoordinates }) {
    const map = useMap();

    useEffect(() => {
        if (routeCoordinates && routeCoordinates.length > 0) {
            const bounds = L.latLngBounds(routeCoordinates);
            map.fitBounds(bounds, {
                padding: [80, 80],
                animate: true,
                duration: 0.8,
                maxZoom: 15
            });
        }
    }, [routeCoordinates, map]);

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

        // Cerrar todos los popups antes de resetear
        map.closePopup();

        map.fitBounds(bounds, {
            padding: [50, 50],
            animate: true,
            duration: 0.8,
            maxZoom: 14
        });
    }, [trigger, zonasFrescas, puntosHidratacion, map]);

    // Escuchar evento de reset
    useEffect(() => {
        const handleReset = () => {
            const coords = [];
            zonasFrescas?.forEach(z => coords.push([z.latitud, z.longitud]));
            puntosHidratacion?.forEach(p => coords.push([p.latitud, p.longitud]));

            if (coords.length === 0) return;

            const bounds = L.latLngBounds(coords);
            
            // Cerrar todos los popups
            map.closePopup();
            
            map.fitBounds(bounds, {
                padding: [50, 50],
                animate: true,
                duration: 0.8,
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

// Ícono negro para posicion del usuario
const blackDivIcon = new L.DivIcon({
    html: `<span class="black-div-marker"></span>`,
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
    routeCoordinates = null, // Nueva prop para coordenadas de ruta
    highlightedMarker = null, // Nueva prop para resaltar marcador
}) {
    // Referencias para marcadores
    const markerRefs = useRef({});
    
    // Estado para la ubicación del usuario
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(true);

    // Obtener ubicación del usuario al montar el componente
    useEffect(() => {
        if ("geolocation" in navigator) {
            setLoadingLocation(true);
            
            // Opciones para optimizar la obtención de ubicación
            const options = {
                enableHighAccuracy: false, // Más rápido, menos preciso
                timeout: 5000, // Timeout de 5 segundos
                maximumAge: 30000 // Usa cache de hasta 30 segundos
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setLocationError(null);
                    setLoadingLocation(false);
                },
                (error) => {
                    console.error("Error obteniendo ubicación:", error);
                    setLocationError(error.message);
                    setLoadingLocation(false);
                },
                options
            );

            // Opcional: Actualizar ubicación en tiempo real
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error actualizando ubicación:", error);
                },
                options
            );

            // Limpiar watch al desmontar
            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            setLocationError("Geolocalización no disponible");
            setLoadingLocation(false);
        }
    }, []);

    // Función para calcular distancia desde ubicación del usuario
    const calcularDistanciaDesdeUsuario = (latitud, longitud) => {
        if (!userLocation) return null;
        
        const distanciaKm = calcularDistancia(
            userLocation.lat,
            userLocation.lng,
            latitud,
            longitud
        );
        
        return formatearDistancia(distanciaKm);
    };

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

    // Abrir popup cuando hay marcador resaltado
    useEffect(() => {
        if (highlightedMarker) {
            const markerId = highlightedMarker.id_zona || highlightedMarker.id_punto;
            if (markerId && markerRefs.current[markerId]) {
                // Pequeño delay para asegurar que el mapa se haya ajustado
                setTimeout(() => {
                    try {
                        markerRefs.current[markerId].openPopup();
                    } catch (e) {
                        console.log("Error abriendo popup:", e);
                    }
                }, 500);
            }
        }
    }, [highlightedMarker]);

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

                {/* Ajustar vista cuando hay ruta */}
                <FitRouteBounds routeCoordinates={routeCoordinates} />

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

                {/* MARCADOR NEGRO - UBICACIÓN DEL USUARIO */}
                {userLocation && (
                    <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={blackDivIcon}
                        zIndexOffset={1000} // Para que siempre esté al frente
                    >
                        <Popup>
                            <strong>Tu ubicación</strong><br />
                            Lat: {userLocation.lat.toFixed(5)}<br />
                            Lng: {userLocation.lng.toFixed(5)}
                        </Popup>
                    </Marker>
                )}

                {/* RUTA TRAZADA - Si existe routeCoordinates */}
                {routeCoordinates && routeCoordinates.length > 0 && (
                    <Polyline
                        positions={routeCoordinates}
                        color="#2563eb"
                        weight={4}
                        opacity={0.8}
                        dashArray="10, 5"
                        lineJoin="round"
                    />
                )}

                {/* Marcadores verdes para zonas frescas */}
                {Array.isArray(zonasFrescas) && zonasFrescas.map((z) => {
                    const distancia = calcularDistanciaDesdeUsuario(z.latitud, z.longitud);
                    const isHighlighted = highlightedMarker && highlightedMarker.id_zona === z.id_zona;
                    
                    return (
                        <Marker
                            key={z.id_zona}
                            position={[z.latitud, z.longitud]}
                            icon={greenDivIcon}
                            ref={(ref) => (markerRefs.current[z.id_zona] = ref)}
                            eventHandlers={{ click: () => onSelectMarker(z) }}
                            zIndexOffset={isHighlighted ? 500 : 0}
                        >
                            <Popup>
                                <div className="popup-content">
                                    {isHighlighted && <div className="popup-badge">📍 Más cercana</div>}
                                    <strong>{z.nombre}</strong><br />
                                    <strong>Descripción: </strong>{z.descripcion}<br />
                                    <strong>Estado: </strong>{z.estado}<br />
                                    {distancia && (
                                        <>
                                            <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                                            <strong>📍 Distancia: </strong>
                                            <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{distancia}</span>
                                        </>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Marcadores azules para puntos de hidratación */}
                {Array.isArray(puntosHidratacion) && puntosHidratacion.map((p) => {
                    const distancia = calcularDistanciaDesdeUsuario(p.latitud, p.longitud);
                    const isHighlighted = highlightedMarker && highlightedMarker.id_punto === p.id_punto;
                    
                    return (
                        <Marker
                            key={p.id_punto}
                            position={[p.latitud, p.longitud]}
                            icon={blueDivIcon}
                            ref={(ref) => (markerRefs.current[p.id_punto] = ref)}
                            eventHandlers={{ click: () => onSelectMarker(p) }}
                            zIndexOffset={isHighlighted ? 500 : 0}
                        >
                            <Popup>
                                <div className="popup-content">
                                    {isHighlighted && <div className="popup-badge">📍 Más cercano</div>}
                                    <strong>{p.nombre}</strong><br />
                                    <strong>Descripción: </strong>{p.descripcion}<br />
                                    <strong>Estado: </strong>{p.estado}<br />
                                    {distancia && (
                                        <>
                                            <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                                            <strong>📍 Distancia: </strong>
                                            <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{distancia}</span>
                                        </>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

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

            {/* Mensaje de error si no hay geolocalización */}
            {locationError && (
                <div className="mv-location-error">
                    📍 No se pudo obtener tu ubicación. Verifica los permisos del navegador.
                </div>
            )}

            {/* Mensaje de carga mientras obtiene ubicación */}
            {loadingLocation && !locationError && (
                <div className="mv-location-loading">
                    <div className="mv-loading-spinner"></div>
                    <span>📍 Obteniendo tu ubicación...</span>
                </div>
            )}

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
                    Ver mapa completo.
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