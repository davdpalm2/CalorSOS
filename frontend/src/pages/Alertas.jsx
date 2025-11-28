// Inicio Alertas.jsx

// frontend/src/pages/Alertas.jsx

// Página para mostrar alertas de calor y notificaciones al usuario

// Importación de librerías
import React, { useEffect, useState } from "react";

// Importación de componentes
import NavbarSmart from '../components/ui/NavbarSmart';

// Importación de estilos
import "../assets/styles/Alertas.css";

// Servicios
import alertasService from "../services/alertasService.js";

export default function Alertas() {
    const [alertaActual, setAlertaActual] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cargar alerta actual + historial
    useEffect(() => {
        cargarDatos();
    }, []);


    const cargarDatos = async () => {
        try {
            setLoading(true);

            const resActual = await alertasService.obtenerAlertaActual();
            setAlertaActual(resActual.data.data);

            const historialData = await alertasService.listarAlertas();

            // Sort by fecha_alerta descending (most recent first) and limit to 10
            const sortedHistorial = (historialData || []).sort((a, b) => new Date(b.fecha_alerta) - new Date(a.fecha_alerta));
            const limitedHistorial = sortedHistorial.slice(0, 10);
            
            setHistorial(limitedHistorial);
        } catch (err) {
            console.error("Error cargando alertas:", err);
        } finally {
            setLoading(false);
        }
    };


    // Obtener color según nivel
    const getColor = (nivel) => {
        switch (nivel) {
            case "bajo": return "green";
            case "medio": return "orange";
            case "alto": return "red";
            case "extremo": return "darkred";
            default: return "gray";
        }
    };

    return (
        <div className="alertas-page">
            <NavbarSmart />

            <div className="container-alertas">

                <h2 className="titulo">🔥 Alertas de calor</h2>

                {/* LOADING */}
                {loading && <p className="loading">Cargando datos...</p>}

                {/* ALERTA ACTUAL */}
                <section className="alerta-actual">
                    <h3>🔔 Alerta actual</h3>

                    {!alertaActual ? (
                        <p className="sin-alerta">No hay una alerta activa ahora mismo.</p>
                    ) : (
                        <div
                            className="alerta-card"
                            style={{ borderLeft: `6px solid ${getColor(alertaActual.nivel_riesgo)}` }}
                        >
                            <p className="alerta-nivel">
                                Nivel: <strong style={{ color: getColor(alertaActual.nivel_riesgo) }}>
                                    {alertaActual.nivel_riesgo.toUpperCase()}
                                </strong>
                            </p>

                            <p>🌡 Temperatura: <strong>{alertaActual.temperatura}°C</strong></p>
                            <p>💧 Humedad: <strong>{alertaActual.humedad}%</strong></p>
                            <p>☀️ Índice UV: <strong>{alertaActual.indice_uv}</strong></p>
                            <p>🕒 Fecha: {new Date(alertaActual.fecha_alerta).toLocaleString()}</p>
                            <p className="fuente">Fuente: {alertaActual.fuente}</p>
                        </div>
                    )}
                </section>

                {/* HISTORIAL */}
                <section className="historial-alertas">
                    <h3>📜 Historial de alertas</h3>

                    {historial.length === 0 ? (
                        <p>No hay alertas registradas.</p>
                    ) : (
                        <div className="lista-alertas">
                            {historial.map((a) => (
                                <div 
                                    key={a.id_alerta}
                                    className="alerta-item"
                                    style={{ borderLeft: `5px solid ${getColor(a.nivel_riesgo)}` }}
                                >
                                    <div>
                                        <strong>{a.nivel_riesgo.toUpperCase()}</strong> — {new Date(a.fecha_alerta).toLocaleString()}
                                    </div>
                                    <div className="item-detalles">
                                        Temp: {a.temperatura}°C | UV: {a.indice_uv} | Humedad: {a.humedad}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

// Fin Alertas.jsx
