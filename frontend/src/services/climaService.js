// src/services/climaService.js
import API from "./api.js"; // tu cliente Axios ya configurado

// Obtener clima actual
export const getClima = async () => {
    try {
        const res = await API.get("/clima/");
        return res.data; // contiene { status: "success", data: {...} }
    } catch (error) {
        console.error("Error obteniendo clima:", error);
        return null;
    }
};

// Obtener histórico de sensación térmica
export const getClimaHistorico = async (dias = 1) => {
    try {
        const res = await API.get("/clima/historico", {
            params: { dias },
        });
        return res.data; // lista de { hora: "HH:MM", sensacion: number }
    } catch (error) {
        console.error("Error obteniendo histórico del clima:", error);
        return [];
    }
};

// Obtener histórico de temperatura y humedad
export const getClimaHistoricoTempHumedad = async (dias = 1) => {
    try {
        const res = await API.get("/clima/historico-temp-humedad", {
            params: { dias },
        });
        return res.data; // lista de { hora: "HH:MM" o "DD/MM", temperatura: val, humedad: val }
    } catch (error) {
        console.error("Error obteniendo histórico temp/humedad:", error);
        return [];
    }
};