# backend/app/routers/usuarios.py
from fastapi import APIRouter, HTTPException, Form, Depends, Body
from backend.models.usuarios_mdls import UsuarioModel
from backend.app.security.hashing import hash_password, verify_password
from backend.app.security.auth import create_access_token, verify_token
from backend.app.security.jwt_handler import verificar_token, verificar_rol

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

# REGISTRO DE USUARIOS
@router.post("/register")
def register(
    nombre: str = Form(...),
    correo: str = Form(...),
    password: str = Form(...),
    telefono: str = Form(None),
    rol: str = Form("usuario")
):
    """
    Registra un nuevo usuario con contraseña cifrada.
    """
    try:
        # Verificar si el correo ya existe
        existente = UsuarioModel.obtener_usuario_por_correo(correo)
        if existente:
            raise HTTPException(status_code=400, detail="El correo ya está registrado")

        hashed_pw = hash_password(password)
        usuario = UsuarioModel.crear_usuario(
            nombre=nombre,
            correo=correo,
            password=hashed_pw,
            telefono=telefono,
            rol=rol
        )
        return {
            "status": "success",
            "message": "Usuario registrado correctamente",
            "data": usuario
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el registro: {str(e)}")

# LOGIN DE USUARIOS
@router.post("/login")
def login(correo: str = Form(...), password: str = Form(...)):
    """
    Autentica un usuario y genera un token JWT.
    """
    try:
        usuario = UsuarioModel.obtener_usuario_por_correo(correo)
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        if not verify_password(password, usuario["password"]):
            raise HTTPException(status_code=401, detail="Contraseña incorrecta")

        token = create_access_token({
            "id_usuario": usuario["id_usuario"],
            "correo": usuario["correo"],
            "rol": usuario["rol"]
        })

        return {
            "status": "success",
            "access_token": token,
            "token_type": "bearer"
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al iniciar sesión: {str(e)}")

# PERFIL DEL USUARIO AUTENTICADO
@router.get("/perfil")
def perfil(usuario: dict = Depends(verify_token)):
    """
    Devuelve los datos del usuario autenticado según el token JWT.
    """
    return {"status": "success", "data": usuario}

# LISTAR TODOS LOS USUARIOS (ADMIN)
@router.get("/")
def listar_todos_los_usuarios(datos_usuario: dict = Depends(verificar_rol(["admin"]))):
    """
    Lista todos los usuarios registrados. Solo accesible para rol 'admin'.
    """
    usuarios = UsuarioModel.listar_usuarios()
    return {
        "status": "success",
        "total": len(usuarios),
        "usuarios": usuarios
    }

# INICIO DE SESION
@router.post("/login")
def login(correo: str = Form(...), password: str = Form(...)):
    """Inicia sesión y devuelve un token JWT."""
    return {"status": "success", "data": UsuarioModel.autenticar_usuario(correo, password)}

# OBTENER PERFIL SEGUN USUARIO
@router.get("/perfil")
def obtener_perfil(datos_usuario: dict = Depends(verificar_token)):
    """
    Devuelve los datos del usuario autenticado usando el token JWT.
    """
    return {
        "status": "success",
        "message": "Acceso permitido",
        "usuario_actual": datos_usuario
    }

@router.get("/admin")
def ruta_admin(datos_usuario: dict = Depends(verificar_rol(["admin"]))):
    """
    Solo accesible para usuarios con rol 'admin'.
    """
    return {
        "status": "success",
        "message": "Bienvenido al panel de administrador",
        "usuario_actual": datos_usuario
    }
    

# OBTENER USUARIO 
@router.get("/{id_usuario}")
def obtener_usuario_por_id(id_usuario: str, datos_usuario: dict = Depends(verificar_token)):
    """
    Permite obtener la información de un usuario por su ID.
    - Un usuario solo puede ver su propio perfil.
    - Un admin puede ver el perfil de cualquier usuario.
    """
    # Si el usuario autenticado no es admin y trata de ver otro perfil → error
    if datos_usuario["rol"] != "admin" and datos_usuario["id_usuario"] != id_usuario:
        raise HTTPException(status_code=403, detail="No tienes permisos para acceder a este perfil")

    usuario = UsuarioModel.obtener_usuario_por_id(id_usuario)
    return {
        "status": "success",
        "usuario": usuario
    }

# ACTUALIZAR USUARIO
@router.put("/{id_usuario}")
def actualizar_usuario(
    id_usuario: str,
    data: dict = Body(...),
    datos_usuario: dict = Depends(verificar_token)
):
    """
    Permite actualizar el perfil del usuario.
    - Un usuario solo puede actualizar su propio perfil.
    - Un admin puede actualizar cualquier perfil.
    """
    if datos_usuario["rol"] != "admin" and datos_usuario["id_usuario"] != id_usuario:
        raise HTTPException(status_code=403, detail="No tienes permisos para modificar este perfil")

    usuario_actualizado = UsuarioModel.actualizar_usuario(id_usuario, data)
    return {
        "status": "success",
        "message": "Usuario actualizado correctamente",
        "usuario": usuario_actualizado
    }

# Eliminar usuario (solo admin)
@router.delete("/{id_usuario}")
def eliminar_usuario(id_usuario: str, datos_usuario: dict = Depends(verificar_rol(["admin"]))):
    """Elimina un usuario por su ID (solo administradores)."""
    return UsuarioModel.eliminar_usuario(id_usuario)
