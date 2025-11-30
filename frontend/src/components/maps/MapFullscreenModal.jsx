// Inicio MapFullscreenModal.jsx

// frontend/src/components/maps/MapFullscreenModal.jsx

// Componente modal para mostrar mapa en pantalla completa

// Importaciones de React y hooks
import React, { useEffect, useState } from "react";

// Importación de estilos
import "./MapFullscreenModal.css";

// Importación de MapView como fallback
import MapView from "./MapView.jsx";

// Componente funcional principal
export default function MapFullscreenModal({
    open,
    onClose,
    children,
    // Props opcionales para el MapView fallback
    zonasFrescas = null,
    puntosHidratacion = null,
    resetView = false,
    enableSelection = false,
    onMapClick = null,
    zonaSeleccionada = null,
    puntoSeleccionado = null,
    onSelectMarker = null,
    reportes = [],
    selectedMarker = null,
    markerPosition = null,
    routeCoordinates = null,
    highlightedMarker = null
}) {
    // Estado para controlar la visibilidad del mapa
    const [showMap, setShowMap] = useState(false);

    // Efecto para manejar la apertura del modal con delay
    useEffect(() => {
        if (open) {
            // Pequeño delay para evitar problemas de tamaño al abrir modal
            setTimeout(() => setShowMap(true), 120);
        } else {
            setShowMap(false);
        }
    }, [open]);

    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    // No renderizar si el modal no está abierto
    if (!open) return null;

    return (
        <div className="mfm-backdrop">
            <div className="mfm-window">
                <button className="mfm-close-btn" onClick={onClose}>
                    ✕ Cerrar
                </button>

                <div className="mfm-map-container">
                    {showMap && (
                        <>
                            {/* Si el padre pasó children, los usamos tal cual */}
                            {children ? (
                                children
                            ) : (
                                /* Si NO hay children, renderizamos un MapView con las props */
                                <MapView
                                    mini={false}
                                    zonasFrescas={zonasFrescas || []}
                                    puntosHidratacion={puntosHidratacion || []}
                                    zonaSeleccionada={zonaSeleccionada}
                                    puntoSeleccionado={puntoSeleccionado}
                                    onSelectMarker={onSelectMarker || (() => {})}
                                    resetView={resetView}
                                    reportes={reportes}
                                    selectedMarker={selectedMarker}
                                    markerPosition={markerPosition}
                                    enableSelection={enableSelection}
                                    onMapClick={onMapClick}
                                    showExpandButton={false}
                                    routeCoordinates={routeCoordinates}
                                    highlightedMarker={highlightedMarker}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Fin MapFullscreenModal.jsx