// Inicio StatCard.jsx

// frontend/src/components/ui/StatCard.jsx

// Componente de tarjeta para mostrar estadísticas con título, valor y unidad

// Importaciones de React
import React from "react";

// Importación de estilos
import "../../assets/styles/StatCard.css";

// Componente funcional principal
export default function StatCard({ title, value, unit }) {
    return (
        <div className="sc-card" role="group" aria-labelledby={`sc-${title}`}>
            <div className="sc-title" id={`sc-${title}`}>{title}</div>
            <div className="sc-value" aria-hidden="false">
                <span className="sc-number">{value}</span>
                <span className="sc-unit">{unit}</span>
            </div>
        </div>
    );
}

// Fin StatCard.jsx
