# backend/models/admin_mdls.py
from backend.database.supabase_config import supabase
from fastapi import HTTPException

class AdminModel:
    """Modelo para operaciones administrativas relacionadas con los reportes."""

    @staticmethod
    def validar_reporte(id_reporte: str):
        """Cambia el estado de un reporte a 'validado'."""
        try:
            response = supabase.table("reportes").update({"estado": "validado"}).eq("id_reporte", id_reporte).execute()
            if not response.data:
                raise HTTPException(status_code=404, detail="Reporte no encontrado para validar")
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al validar reporte: {str(e)}")

    @staticmethod
    def rechazar_reporte(id_reporte: str):
        """Cambia el estado de un reporte a 'rechazado'."""
        try:
            response = supabase.table("reportes").update({"estado": "rechazado"}).eq("id_reporte", id_reporte).execute()
            if not response.data:
                raise HTTPException(status_code=404, detail="Reporte no encontrado para rechazar")
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al rechazar reporte: {str(e)}")
