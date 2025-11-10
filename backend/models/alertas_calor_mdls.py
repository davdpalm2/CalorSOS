# backend/models/alerta_calor_mdls.py
from backend.database.supabase_config import supabase
from fastapi import HTTPException
from typing import Optional

class AlertaCalorModel:
    """Modelo para interactuar con la tabla alertas_calor en Supabase."""

    @staticmethod
    def crear_alerta(temperatura: float, humedad: float, indice_uv: float,
                    nivel_riesgo: str, fuente: str = "OpenWeatherMap"):
        """Crea una nueva alerta de calor en la base de datos."""
        try:
            data = {
                "temperatura": temperatura,
                "humedad": humedad,
                "indice_uv": indice_uv,
                "nivel_riesgo": nivel_riesgo,
                "fuente": fuente
            }
            response = supabase.table("alertas_calor").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al crear alerta de calor: {str(e)}")

    @staticmethod
    def listar_alertas():
        """Obtiene todas las alertas de calor registradas."""
        try:
            response = supabase.table("alertas_calor").select("*").execute()
            return response.data
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al listar alertas: {str(e)}")

    @staticmethod
    def obtener_alerta_por_id(id_alerta: str):
        """Obtiene una alerta específica por su ID."""
        try:
            response = supabase.table("alertas_calor").select("*").eq("id_alerta", id_alerta).execute()
            if not response.data:
                raise HTTPException(status_code=404, detail="Alerta no encontrada")
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al obtener alerta: {str(e)}")

    @staticmethod
    def eliminar_alerta(id_alerta: str):
        """Elimina una alerta de calor existente."""
        try:
            response = supabase.table("alertas_calor").delete().eq("id_alerta", id_alerta).execute()
            return {"message": "Alerta eliminada correctamente"} if response.data else {"message": "No se encontró la alerta"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al eliminar alerta: {str(e)}")
