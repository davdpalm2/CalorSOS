// src/services/reportesService.js
import API from "./api";

/**
 * Crear un nuevo reporte.
 * @param {Object} reporte - Datos del reporte: tipo, nombre, descripcion, latitud, longitud
 * @returns {Promise<Object>} - Respuesta del backend
 */
export const crearReporte = async (reporte) => {
    try {
        const formData = new FormData();
        formData.append("tipo", reporte.tipo);
        if (reporte.nombre) formData.append("nombre", reporte.nombre);
        if (reporte.descripcion) formData.append("descripcion", reporte.descripcion);
        if (reporte.latitud) formData.append("latitud", reporte.latitud);
        if (reporte.longitud) formData.append("longitud", reporte.longitud);

        if (reporte.tipo === "zona_fresca" && reporte.tipo_zona_fresca) {
            formData.append("tipo_zona_fresca", reporte.tipo_zona_fresca);
        }

        const response = await API.post("/reportes/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return response.data;
    } catch (error) {
        console.error("Error creando reporte:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Listar todos los reportes (solo admin).
 * @param {Object} filtros - Filtros opcionales: id_usuario, tipo, estado
 * @returns {Promise<Array>} - Lista de reportes
 */
export const listarReportes = async (filtros = {}) => {
    try {
        const params = new URLSearchParams();
        if (filtros.id_usuario) params.append("id_usuario", filtros.id_usuario);
        if (filtros.tipo) params.append("tipo", filtros.tipo);
        if (filtros.estado) params.append("estado", filtros.estado);

        const response = await API.get(`/reportes/?${params.toString()}`);
        return response.data.data;
    } catch (error) {
        console.error("Error listando reportes:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Validar un reporte (solo admin).
 * @param {string} idReporte - ID del reporte
 * @returns {Promise<Object>} - Reporte validado
 */
export const validarReporte = async (idReporte) => {
    try {
        const response = await API.put(`/admin/validar_reporte/${idReporte}`);
        return response.data.data;
    } catch (error) {
        console.error("Error validando reporte:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Rechazar un reporte (solo admin).
 * @param {string} idReporte - ID del reporte
 * @returns {Promise<Object>} - Reporte rechazado
 */
export const rechazarReporte = async (idReporte) => {
    try {
        const response = await API.put(`/admin/rechazar_reporte/${idReporte}`);
        return response.data.data;
    } catch (error) {
        console.error("Error rechazando reporte:", error.response?.data || error.message);
        throw error;
    }
};

