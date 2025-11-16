// src/components/ui/ReportCTA.jsx
import React from "react";
import "../../assets/styles/ReportCTA.css";

export default function ReportCallToAction({ onClick }) {

  return (
    <div className="rca-wrap">
      <div className="rca-inner">
        <div className="rca-text">
          ¿Deseas reportar un nuevo punto de hidratación o zona fresca? Envía un reporte comunitario.
        </div>
        <div className="rca-action">
          <button className="rca-btn" onClick={onClick}>
            Nuevo reporte
          </button>
        </div>
      </div>
    </div>
  );
}
