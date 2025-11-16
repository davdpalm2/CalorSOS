# backend/models/admin_mdls.py
from backend.database.supabase_config import supabase
from fastapi import HTTPException
from backend.models.punto_hidratacion_mdls import PuntoHidratacionModel
from backend.models.zonas_frescas_mdls import ZonaFrescaModel
from backend.models.reportes_mdls import ReporteModel

class AdminModel:
    """Modelo para operaciones administrativas relacionadas con los reportes."""

    @staticmethod
    def validar_reporte(id_reporte: str, admin_id: str):
        """
        Valida un reporte y lo convierte en zona fresca o punto de hidratación según su tipo.
        """
        try:
            # Obtener el reporte completo
            reporte = ReporteModel.obtener_reporte_por_id(id_reporte)

            if reporte["estado"] != "pendiente":
                raise HTTPException(status_code=400, detail="El reporte ya ha sido procesado")

            # Según el tipo del reporte, crear la entidad correspondiente
            if reporte["tipo"] == "zona_fresca":
                # Crear zona fresca
                zona_data = {
                    "nombre": reporte.get("nombre", "Zona Fresca Reportada"),
                    "descripcion": reporte.get("descripcion"),
                    "latitud": reporte["latitud"],
                    "longitud": reporte["longitud"],
                    "tipo": reporte.get("tipo_zona_fresca", "urbana"),
                    "estado": "activa",
                    "validado_por": admin_id
                }
                nueva_zona = ZonaFrescaModel.crear_zona(**zona_data)

                # Marcar reporte como validado
                ReporteModel.actualizar_reporte(id_reporte, {"estado": "validado"})

                return {
                    "tipo": "zona_fresca",
                    "entidad_creada": nueva_zona,
                    "reporte": reporte
                }

            elif reporte["tipo"] == "hidratacion":
                # Crear punto de hidratación
                punto_data = {
                    "nombre": reporte.get("nombre", "Punto de Hidratación Reportado"),
                    "descripcion": reporte.get("descripcion"),
                    "latitud": reporte["latitud"],
                    "longitud": reporte["longitud"],
                    "estado": "activa",
                    "validado_por": admin_id
                }
                nuevo_punto = PuntoHidratacionModel.crear_punto(**punto_data)

                # Marcar reporte como validado
                ReporteModel.actualizar_reporte(id_reporte, {"estado": "validado"})

                return {
                    "tipo": "hidratacion",
                    "entidad_creada": nuevo_punto,
                    "reporte": reporte
                }

            else:
                raise HTTPException(status_code=400, detail=f"Tipo de reporte '{reporte['tipo']}' no soportado")

        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al validar reporte: {str(e)}")

    @staticmethod
    def rechazar_reporte(id_reporte: str):
        """
        Rechaza un reporte eliminándolo completamente de la base de datos.
        """
        try:
            # Obtener el reporte antes de eliminarlo (para devolver info)
            reporte = ReporteModel.obtener_reporte_por_id(id_reporte)

            # Eliminar el reporte
            ReporteModel.eliminar_reporte(id_reporte)

            return {
                "message": "Reporte rechazado y eliminado correctamente",
                "reporte_eliminado": reporte
            }

        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al rechazar reporte: {str(e)}")
