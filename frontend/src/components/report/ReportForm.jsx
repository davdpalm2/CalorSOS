// src/components/report/ReportForm.jsx
import React, { useState } from "react";
import MapView from "../maps/MapView.jsx";
import { enviarReporte } from "../services/reportesService.js";
import "./ReportForm.css";

export default function ReportForm({ onClose, tipoPreseleccion = null }) {

    const [tipo, setTipo] = useState(tipoPreseleccion || "");
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [foto, setFoto] = useState(null);
    const [ubicacion, setUbicacion] = useState(null);

    const [mensaje, setMensaje] = useState(null);
    const [enviando, setEnviando] = useState(false);

    // Cuando el usuario hace click en un marcador del mapa
    const handleMapClick = (coords) => {
        setUbicacion(coords);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!tipo || !nombre || !descripcion || !ubicacion) {
            setMensaje("Completa todos los campos obligatorios.");
            return;
        }

        setEnviando(true);
        setMensaje(null);

        try {
            const formData = new FormData();
            formData.append("tipo", tipo);
            formData.append("nombre", nombre);
            formData.append("descripcion", descripcion);
            formData.append("latitud", ubicacion.lat);
            formData.append("longitud", ubicacion.lng);
            if (foto) formData.append("foto", foto);

            const resp = await enviarReporte(formData);

            if (!resp.ok) throw new Error("Error enviando el reporte");

            setMensaje("Reporte enviado correctamente 🎉");
            setTimeout(onClose, 1200);

        } catch (err) {
            console.error(err);
            setMensaje("Ocurrió un error al enviar el reporte.");
        }

        setEnviando(false);
    };

    return (
        <div className="report-form">

            <h2>Nuevo reporte comunitario</h2>

            <form onSubmit={handleSubmit}>

                {/* Tipo */}
                {!tipoPreseleccion && (
                    <label>
                        Tipo de reporte:
                        <select value={tipo} onChange={(e) => setTipo(e.target.value)} required>
                            <option value="">Seleccione</option>
                            <option value="zona_fresca">Zona fresca</option>
                            <option value="punto_hidratacion">Punto de hidratación</option>
                        </select>
                    </label>
                )}

                {/* Nombre */}
                <label>
                    Nombre:
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </label>

                {/* Descripción */}
                <label>
                    Descripción:
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        required
                    />
                </label>

                {/* Foto */}
                <label>
                    Foto (opcional):
                    <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files[0])} />
                </label>

                {/* Mapa pequeño para seleccionar ubicación */}
                <div className="map-selector">
                    <p>Selecciona la ubicación en el mapa:</p>
                    <MapView
                        mini={true}
                        onSelectMarker={(coords) => handleMapClick(coords)}
                        puntosHidratacion={[]}
                        zonasFrescas={[]}
                    />
                </div>

                {/* Info ubicación */}
                {ubicacion && (
                    <div className="coords-preview">
                        📍 Ubicación: {ubicacion.lat.toFixed(5)}, {ubicacion.lng.toFixed(5)}
                    </div>
                )}

                {mensaje && <p className="msg">{mensaje}</p>}

                <button type="submit" disabled={enviando}>
                    {enviando ? "Enviando..." : "Enviar reporte"}
                </button>
            </form>

        </div>
    );
}
