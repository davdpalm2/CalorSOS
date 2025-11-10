# backend/models/punto_hidratacion_mdls.py
from backend.database.supabase_config import supabase
from fastapi import HTTPException
from typing import Optional

class PuntoHidratacionModel:
    """ Modelo para interactuar con la tabla puntos_hidratacion en Supabase."""

    @staticmethod
    def crear_punto(nombre: str, direccion: Optional[str], latitud: float, longitud: float, 
                    estado: str = "pendiente", fuente: str = "reporte ciudadano", 
                    validado_por: Optional[str] = None):
        """Inserta un nuevo punto de hidratación en la base de datos."""
        try:
            data = {
                "nombre": nombre,
                "direccion": direccion,
                "latitud": latitud,
                "longitud": longitud,
                "estado": estado,
                "fuente": fuente,
                "validado_por": validado_por
            }
            response = supabase.table("puntos_hidratacion").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al crear punto de hidratación: {str(e)}")

    @staticmethod
    def listar_puntos(estado: Optional[str] = None):
        """Obtiene todos los puntos de hidratación, filtrando por estado si se indica."""
        try:
            query = supabase.table("puntos_hidratacion").select("*")
            if estado:
                query = query.eq("estado", estado)
            response = query.execute()
            return response.data
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al listar puntos: {str(e)}")

    @staticmethod
    def obtener_punto_por_id(id_punto: str):
        """Obtiene un punto de hidratación por su ID único."""
        try:
            response = supabase.table("puntos_hidratacion").select("*").eq("id_punto", id_punto).execute()
            if not response.data:
                raise HTTPException(status_code=404, detail="Punto de hidratación no encontrado")
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al obtener punto: {str(e)}")

    @staticmethod
    def actualizar_punto(id_punto: str, data: dict):
        """Actualiza los datos de un punto de hidratación existente."""
        try:
            response = supabase.table("puntos_hidratacion").update(data).eq("id_punto", id_punto).execute()
            if not response.data:
                raise HTTPException(status_code=404, detail="Punto no encontrado para actualizar")
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al actualizar punto: {str(e)}")

    @staticmethod
    def eliminar_punto(id_punto: str):
        """Elimina un punto de hidratación de la base de datos."""
        try:
            response = supabase.table("puntos_hidratacion").delete().eq("id_punto", id_punto).execute()
            return {"message": "Punto eliminado correctamente"} if response.data else {"message": "No se encontró el punto"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al eliminar punto: {str(e)}")
