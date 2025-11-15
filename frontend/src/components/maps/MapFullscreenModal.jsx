// src/components/maps/MapFullscreenModal.jsx
import React, { useEffect, useState } from "react";
import MapView from "./MapView";

import "./MapFullscreenModal.css";

export default function MapFullscreenModal({ open, onClose }) {
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        if (open) {
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
            {showMap && <MapView mini={false} />}
            </div>
        </div>
        </div>
    );
}
