# backend/models/zona_fresca_mdls.py
from backend.database.supabase_config import supabase
from fastapi import HTTPException
from typing import Optional

class ZonaFrescaModel:
    """ Modelo para interactuar con la tabla zonas_frescas en Supabase."""

    @staticmethod
    def crear_zona(nombre: str, descripcion: Optional[str], latitud: float, longitud: float, tipo: str = "urbana", estado: str = "activa", validado_por: Optional[str] = None):
        """Crea una nueva zona fresca."""
        try:
            data = {
                "nombre": nombre,
                "descripcion": descripcion,
                "latitud": latitud,
                "longitud": longitud,
                "tipo": tipo,
                "estado": estado,
                "validado_por": validado_por
            }
            response = supabase.table("zonas_frescas").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al crear zona fresca: {str(e)}")

    @staticmethod
    def listar_zonas(estado: Optional[str] = None):
        """Lista todas las zonas frescas, con opción de filtrar por estado."""
        try:
            query = supabase.table("zonas_frescas").select("*")
            if estado:
                query = query.eq("estado", estado)
            response = query.execute()
            return response.data
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al listar zonas: {str(e)}")

    @staticmethod
    def obtener_zona_por_id(id_zona: str):
        """Obtiene una zona fresca específica por su ID."""
        try:
            response = supabase.table("zonas_frescas").select("*").eq("id_zona", id_zona).execute()
            if not response.data:
                raise HTTPException(status_code=404, detail="Zona fresca no encontrada")
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al obtener zona: {str(e)}")

    @staticmethod
    def actualizar_zona(id_zona: str, data: dict):
        """Actualiza la información de una zona fresca."""
        try:
            response = supabase.table("zonas_frescas").update(data).eq("id_zona", id_zona).execute()
            if not response.data:
                raise HTTPException(status_code=404, detail="Zona no encontrada para actualizar")
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al actualizar zona: {str(e)}")

    @staticmethod
    def eliminar_zona(id_zona: str):
        """Elimina una zona fresca por su ID."""
        try:
            response = supabase.table("zonas_frescas").delete().eq("id_zona", id_zona).execute()
            return {"message": "Zona eliminada correctamente"} if response.data else {"message": "No se encontró la zona"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al eliminar zona: {str(e)}")
