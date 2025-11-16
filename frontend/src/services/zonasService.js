import API from "./api";

const zonasService = {
    async listarZonas(estado = "activa") {
        try {
            const res = await API.get(`/zonas_frescas?estado=${estado}`);
            return res.data.data;
        } catch (error) {
            console.error("Error al listar zonas frescas:", error);
            throw error;
        }
    },

    async obtenerZona(id) {
        try {
            const res = await API.get(`/zonas_frescas/${id}`);
            return res.data.data;
        } catch (error) {
            console.error("Error al obtener zona fresca:", error);
            throw error;
        }
    },

    async crearZona(data) {
        try {
            const res = await API.post("/zonas_frescas", data);
            return res.data.data;
        } catch (error) {
            console.error("Error al crear zona fresca:", error);
            throw error;
        }
    },
};

export default zonasService;