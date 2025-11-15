// src/components/ui/ReportCallToAction.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/ReportCTA.css";

export default function ReportCallToAction() {
  const navigate = useNavigate();

  const handleNuevoReporte = () => {
    navigate("/reportes");
  };

  return (
    <div className="rca-wrap">
      <div className="rca-inner">
        <div className="rca-text">
          ¿Deseas reportar un nuevo punto o situación? Envía un reporte comunitario.
        </div>
        <div className="rca-action">
          <button className="rca-btn" onClick={handleNuevoReporte}>
            Nuevo reporte
          </button>
        </div>
      </div>
    </div>
  );
}
