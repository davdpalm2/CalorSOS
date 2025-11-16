// src/components/maps/MapFullscreenModal.jsx
import React, { useEffect, useState } from "react";
import "./MapFullscreenModal.css";

// IMPORTAMOS MapView aquí para usarlo como fallback cuando no se pasan children
import MapView from "./MapView.jsx";

export default function MapFullscreenModal({
  open,
  onClose,
  children,
  // Props opcionales para el MapView fallback
  zonasFrescas = null,
  puntosHidratacion = null,
  resetView = false,
  enableSelection = false,
  onMapClick = null
}) {
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (open) {
      // pequeño delay para evitar problemas de tamaño al abrir modal
      setTimeout(() => setShowMap(true), 120);
    } else {
      setShowMap(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="mfm-backdrop">
      <div className="mfm-window">
        <button className="mfm-close-btn" onClick={onClose}>
          Cerrar
        </button>

        <div className="mfm-map-container">
          {showMap && (
            <>
              {/* Si el padre pasó children, los usamos tal cual (comportamiento actual intacto) */}
              {children ? (
                children
              ) : (
                /* Si NO hay children, renderizamos un MapView con las props que recibimos */
                <MapView
                  mini={false}
                  zonasFrescas={zonasFrescas || []}
                  puntosHidratacion={puntosHidratacion || []}
                  resetView={resetView}
                  enableSelection={enableSelection}
                  onMapClick={onMapClick}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
