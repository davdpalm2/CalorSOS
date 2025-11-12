# backend/models/usuario_mdls.py
from backend.app.security.hashing import verify_password
from backend.app.security.jwt_handler import crear_token
from backend.database.supabase_config import supabase
from fastapi import HTTPException
from typing import Optional

class UsuarioModel:
    """Modelo de acceso a datos para la tabla 'usuarios' en Supabase"""

    @staticmethod
    def crear_usuario(nombre: str, correo: str, password: str, telefono: Optional[str] = None, rol: str = "usuario"):
        """Crea un nuevo usuario con contraseña cifrada"""
        try:
            data = {
                "nombre": nombre,
                "correo": correo,
                "telefono": telefono,
                "rol": rol,
                "password": password  # Guardamos el hash, no el texto plano
            }
            response = supabase.table("usuarios").insert(data).execute()
            if not response.data:
                raise HTTPException(status_code=400, detail="No se pudo crear el usuario")
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al crear usuario: {str(e)}")

    @staticmethod
    def obtener_usuario_por_id(id_usuario: str):
        """Obtiene un usuario por su ID"""
        try:
            response = supabase.table("usuarios").select("*").eq("id_usuario", id_usuario).execute()
            if not response.data:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al obtener usuario: {str(e)}")

    @staticmethod
    def obtener_usuario_por_correo(correo: str):
        """Busca un usuario por correo (útil para login)"""
        try:
            response = supabase.table("usuarios").select("*").eq("correo", correo).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al obtener usuario por correo: {str(e)}")

    @staticmethod
    def listar_usuarios():
        """Lista todos los usuarios"""
        try:
            response = supabase.table("usuarios").select("*").execute()
            return response.data
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al listar usuarios: {str(e)}")

    @staticmethod
    def actualizar_usuario(id_usuario: str, data: dict):
        """Actualiza información de un usuario"""
        try:
            response = supabase.table("usuarios").update(data).eq("id_usuario", id_usuario).execute()
            if not response.data:
                raise HTTPException(status_code=404, detail="Usuario no encontrado para actualizar")
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al actualizar usuario: {str(e)}")

    @staticmethod
    def eliminar_usuario(id_usuario: str):
        """Elimina un usuario por su ID"""
        try:
            response = supabase.table("usuarios").delete().eq("id_usuario", id_usuario).execute()
            if not response.data:
                return {"message": "No se encontró el usuario"}
            return {"message": "Usuario eliminado correctamente"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al eliminar usuario: {str(e)}")
    
    @staticmethod
    def autenticar_usuario(correo: str, password: str):
        """Verifica las credenciales del usuario y devuelve un token JWT si son válidas."""
        try:
            response = supabase.table("usuarios").select("*").eq("correo", correo).execute()
            if not response.data:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")

            usuario = response.data[0]
            hashed_password = usuario.get("password")

            if not verify_password(password, hashed_password):
                raise HTTPException(status_code=401, detail="Contraseña incorrecta")

            token = crear_token({"id_usuario": usuario["id_usuario"], "correo": usuario["correo"], "rol": usuario["rol"]})

            return {"access_token": token, "token_type": "bearer", "usuario": usuario}

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error en autenticación: {str(e)}")
