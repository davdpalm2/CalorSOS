# backend/models/punto_hidratacion_mdls.py
from backend.database.supabase_config import supabase
from fastapi import HTTPException
from typing import Optional

class PuntoHidratacionModel:
    """ Modelo final basado en la tabla real en Supabase """

    @staticmethod
    def crear_punto(nombre: str, descripcion: Optional[str], latitud: float, longitud: float,
                    estado: str = "activa", validado_por: Optional[str] = None):
        """Inserta un nuevo punto de hidratación."""
        try:
            data = {
                "nombre": nombre,
                "descripcion": descripcion,
                "latitud": latitud,
                "longitud": longitud,
                "estado": estado,
                "validado_por": validado_por
                # fecha_registro se genera solo en la BD
            }

            response = supabase.table("puntos_hidratacion").insert(data).execute()
            return response.data[0] if response.data else None

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al crear punto de hidratación: {str(e)}")

    @staticmethod
    def listar_puntos(estado: Optional[str] = None):
        """Obtiene todos los puntos, filtrando por estado si se indica."""
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
        """Obtiene un punto por id."""
        try:
            response = supabase.table("puntos_hidratacion")\
                .select("*").eq("id_punto", id_punto).execute()

            if not response.data:
                raise HTTPException(status_code=404, detail="Punto de hidratación no encontrado")

            return response.data[0]

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al obtener punto: {str(e)}")

    @staticmethod
    def actualizar_punto(id_punto: str, data: dict):
        """Actualiza un punto de hidratación."""
        try:
            response = supabase.table("puntos_hidratacion")\
                .update(data).eq("id_punto", id_punto).execute()

            if not response.data:
                raise HTTPException(status_code=404, detail="Punto no encontrado para actualizar")

            return response.data[0]

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al actualizar punto: {str(e)}")

    @staticmethod
    def eliminar_punto(id_punto: str):
        """Elimina un punto."""
        try:
            supabase.table("puntos_hidratacion").delete().eq("id_punto", id_punto).execute()
            return {"message": "Punto eliminado correctamente"}

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al eliminar punto: {str(e)}")
