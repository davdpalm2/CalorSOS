// src/services/reportesService.js
import API from "./api";

/**
 * Crear un nuevo reporte.
 * @param {Object} reporte - Datos del reporte: tipo, nombre, descripcion, latitud, longitud
 * @returns {Promise<Object>} - Respuesta del backend
 */
export const crearReporte = async (reporte) => {
    try {
        // Crear un FormData para enviar como x-www-form-urlencoded / multipart
        const formData = new FormData();
        formData.append("tipo", reporte.tipo);
        if (reporte.nombre) formData.append("nombre", reporte.nombre);
        if (reporte.descripcion) formData.append("descripcion", reporte.descripcion);
        if (reporte.latitud !== undefined && reporte.longitud !== undefined) {
            formData.append("latitud", reporte.latitud?.toString());
            formData.append("longitud", reporte.longitud?.toString());
        }

        // Petición POST al endpoint /reportes/
        const response = await API.post("/reportes/", formData, {
        headers: {
            "Content-Type": "multipart/form-data", // necesario para FormData
        },
        });

        return response.data;
    } catch (error) {
        console.error("Error creando reporte:", error.response?.data || error.message);
        throw error;
    }
};
