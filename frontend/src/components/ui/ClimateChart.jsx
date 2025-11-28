// Inicio ClimateChart.jsx

// frontend/src/components/ui/ClimateChart.jsx

// Componente de gráfico para mostrar temperatura y humedad histórica

// Importaciones de React y hooks
import React, { useEffect, useState } from "react";

// Importaciones de Recharts para gráficos
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Importación del servicio de clima
import { getClimaHistoricoTempHumedad } from "../../services/climaService";

// Importación del componente loader
import LoaderPremium from "../../components/common/LoaderPremium";

// Importación de estilos
import "../../assets/styles/ClimateChart.css";

// Componente funcional principal
export default function TempHumedadChart() {
    // Estados del componente
    const [historico, setHistorico] = useState([]);
    const [dias, setDias] = useState(1);
    const [loading, setLoading] = useState(true);

    // Opciones de días para los botones
    const botonesDias = [1, 2, 3, 4, 5, 6, 7];

    // Efecto para cargar datos históricos
    useEffect(() => {
        async function fetchHistorico() {
            setLoading(true);
            const data = await getClimaHistoricoTempHumedad(dias);
            setHistorico(data);
            setLoading(false);
        }
        fetchHistorico();
    }, [dias]);

    // Componente de tooltip personalizado
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const date = new Date(label);
            return (
                <div className="custom-tooltip" style={{
                    backgroundColor: "#1f2a33",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "8px",
                    color: "#fff",
                    fontSize: "13px"
                }}>
                    <p>{dias === 1
                        ? `Hora: ${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}`
                        : `Fecha: ${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}`}</p>
                    {payload.map((p) => (
                        <p key={p.dataKey} style={{ color: p.stroke, margin: 0 }}>
                            {p.dataKey === "temperatura" ? "Temp" : "Humedad"}: {p.value}{p.dataKey === "temperatura" ? "°C" : "%"}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-container">
            <h3>Gráfico de Temperatura y Humedad</h3>

            {/* Botones para seleccionar días */}
            <div className="chart-buttons">
                {botonesDias.map((d) => (
                    <button
                        key={d}
                        className={dias === d ? "active" : ""}
                        onClick={() => setDias(d)}
                    >
                        {d} Día{d > 1 ? "s" : ""}
                    </button>
                ))}
            </div>

            {/* Loader mientras carga */}
            {loading && (
                <div className="chart-loader">
                    <LoaderPremium />
                </div>
            )}

            {/* Gráfico responsivo */}
            <ResponsiveContainer width="100%" height={350}>
                <LineChart
                    data={historico}
                    margin={{ top: 20, right: 40, left: 0, bottom: 5 }}
                    isAnimationActive={false}
                >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                        dataKey="timestamp"
                        stroke="#cfd9e5"
                        tick={false}
                        interval={0}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            if (dias === 1) {
                                return `${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}`;
                            }
                            return "";
                        }}
                    />
                    <YAxis yAxisId="left" stroke="#ff7300" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#0074d9" tick={{ fontSize: 12 }} />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: "#aaa", strokeWidth: 1, strokeDasharray: "3 3" }}
                    />
                    {/* Línea de temperatura */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="temperatura"
                        stroke="#ff7300"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 6 }}
                        connectNulls
                    />
                    {/* Línea de humedad */}
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="humedad"
                        stroke="#0074d9"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 6 }}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>
            
            {/* Leyenda debajo del gráfico */}
            <div className="chart-legend">
                <span>
                    <span className="dot dot-temp"></span>
                    Temperatura en C° (Izquierda)
                </span>
                <span>
                    <span className="dot dot-hum"></span>
                    Humedad en % (Derecha)
                </span>
            </div>
        </div>
    );
}

// Fin ClimateChart.jsx
