# backend/models/notificacion_mdls.py
from backend.database.supabase_config import supabase
from fastapi import HTTPException
from typing import Optional

class NotificacionModel:
    """Modelo para interactuar con la tabla notificaciones en Supabase."""

    @staticmethod
    def crear_notificacion(id_usuario: str, mensaje: str, estado: str = "pendiente"):
        """Crea una nueva notificación asociada a un usuario."""
        try:
            data = {
                "id_usuario": id_usuario,
                "mensaje": mensaje,
                "estado": estado
            }
            response = supabase.table("notificaciones").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al crear notificación: {str(e)}")

    @staticmethod
    def listar_notificaciones(id_usuario: Optional[str] = None):
        """Lista todas las notificaciones o solo las de un usuario específico."""
        try:
            query = supabase.table("notificaciones").select("*")
            if id_usuario:
                query = query.eq("id_usuario", id_usuario)
            response = query.execute()
            return response.data
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al listar notificaciones: {str(e)}")

    @staticmethod
    def obtener_notificacion_por_id(id_notificacion: str):
        """Obtiene una notificación específica por su ID."""
        try:
            response = supabase.table("notificaciones").select("*").eq("id_notificacion", id_notificacion).execute()
            if not response.data:
                raise HTTPException(status_code=404, detail="Notificación no encontrada")
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al obtener notificación: {str(e)}")

    @staticmethod
    def actualizar_estado(id_notificacion: str, estado: str):
        """Actualiza el estado de una notificación (por ejemplo: pendiente → enviada)."""
        try:
            response = supabase.table("notificaciones").update({"estado": estado}).eq("id_notificacion", id_notificacion).execute()
            if not response.data:
                raise HTTPException(status_code=404, detail="Notificación no encontrada para actualizar")
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al actualizar notificación: {str(e)}")

    @staticmethod
    def eliminar_notificacion(id_notificacion: str):
        """Elimina una notificación por su ID."""
        try:
            response = supabase.table("notificaciones").delete().eq("id_notificacion", id_notificacion).execute()
            return {"message": "Notificación eliminada correctamente"} if response.data else {"message": "No se encontró la notificación"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al eliminar notificación: {str(e)}")
