// src/components/ui/IndicatorsPanel.jsx
import React from "react";
import "../../assets/styles/IndicatorsPanel.css";

export default function IndicatorsPanel({ uv, feelsLike, risk, hydration }) {

    // 1. UV
    const uvMax = 11;
    const uvPct = (uv / uvMax) * 100;

    const uvLabel =
        uv <= 2 ? "Bajo" :
        uv <= 5 ? "Moderado" :
        uv <= 7 ? "Alto" :
        uv <= 10 ? "Muy alto" :
        "Extremo";

    // 2. Sensación térmica
    const feelsPct = ((feelsLike - 20) / 30) * 100;
    const feelsLabel =
        feelsLike < 28 ? "Confortable" :
        feelsLike < 33 ? "Calor moderado" :
        feelsLike < 39 ? "Calor intenso" :
        "Peligroso";

    // 3. Riesgo térmico
    const riskPct = (risk / 5) * 100;
    const riskLabel =
        risk === 0 ? "Sin riesgo" :
        risk === 1 ? "Leve" :
        risk === 2 ? "Moderado" :
        risk === 3 ? "Alto" :
        risk === 4 ? "Muy alto" :
        "Peligroso";

    // 4. Hidratación
    const hydPct = (hydration / 10) * 100;
    const hydLabel =
        hydration <= 3 ? "Baja" :
        hydration <= 6 ? "Media" :
        hydration <= 8 ? "Buena" :
        "Excelente";

    return (
        <div className="ip-container">
            <h3>Indicadores Ambientales</h3>

            {/* UV */}
            <div className="ip-item">
                <span className="ip-title">Índice UV</span>
                <div className="ip-bar">
                    <div className="ip-fill" style={{ width: `${uvPct}%` }}></div>
                </div>
                <span className="ip-value">{uv} / 11 — {uvLabel}</span>
            </div>

            {/* Sensación térmica */}
            <div className="ip-item">
                <span className="ip-title">Sensación Térmica</span>
                <div className="ip-bar">
                    <div className="ip-fill" style={{ width: `${feelsPct}%` }}></div>
                </div>
                <span className="ip-value">{feelsLike}°C — {feelsLabel}</span>
            </div>

            {/* Riesgo térmico */}
            <div className="ip-item">
                <span className="ip-title">Riesgo Térmico</span>
                <div className="ip-bar">
                    <div className="ip-fill" style={{ width: `${riskPct}%` }}></div>
                </div>
                <span className="ip-value">{risk} / 5 — {riskLabel}</span>
            </div>

            {/* Hidratación recomendada */}
            <div className="ip-item">
                <span className="ip-title">Hidratación Recomendada</span>
                <div className="ip-bar">
                    <div className="ip-fill" style={{ width: `${hydPct}%` }}></div>
                </div>
                <span className="ip-value">{hydration} / 10 — {hydLabel}</span>
            </div>
        </div>
    );
}
