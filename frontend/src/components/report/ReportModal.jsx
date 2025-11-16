// src/components/report/ReportModal.jsx
import React from "react";
import "./ReportModal.css";

export default function ReportModal({ open, onClose, children }) {
    if (!open) return null;

    return (
        <div className="rm-backdrop">
            <div className="rm-window">

                {/* Botón cerrar */}
                <button className="rm-close-btn" onClick={onClose}>
                    ✕
                </button>

                {/* Contenido del modal (el formulario irá después) */}
                <div className="rm-content">
                    {children}
                </div>

            </div>
        </div>
    );
}
