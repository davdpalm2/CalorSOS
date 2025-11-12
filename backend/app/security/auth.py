# backend/app/security/auth.py
import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
import os
from dotenv import load_dotenv

# Cargar variables del .env
load_dotenv(dotenv_path="calorsos.env")

SECRET_KEY = os.getenv("JWT_SECRET", "clave-secreta-calorsos")  # puedes cambiarla en tu .env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Dependencia de seguridad
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/usuarios/login")

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Genera un token JWT firmado con la clave secreta"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str = Depends(oauth2_scheme)):
    """Verifica y decodifica un token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload  # retorna info del usuario (id, rol, etc.)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
