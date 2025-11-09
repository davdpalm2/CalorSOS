from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
import requests
import os

# cargamos el archivo calorsos.env
load_dotenv(dotenv_path="calorsos.env")

# Cargar API Key desde calorsos.env
OPENWEATHER_API_KEY = os.getenv("KEY")

router = APIRouter(prefix="/clima", tags=["Datos Climáticos"])

@router.get("/")
def obtener_clima(ciudad: str = "Cartagena"):
    
    # Obtiene información climática actual (temperatura, humedad, índice UV) usando la API de OpenWeatherMap.
    
    try:
        url = (f"https://api.openweathermap.org/data/2.5/weather?" f"q={ciudad}&appid={OPENWEATHER_API_KEY}&units=metric")
        response = requests.get(url, timeout=10)
        data = response.json()

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=data.get("message"))

        clima = {
            "ciudad": data["name"],
            "temperatura": data["main"]["temp"],
            "humedad": data["main"]["humidity"],
            "condicion": data["weather"][0]["description"],
        }

        return {"data": clima}

    except requests.Timeout:
        raise HTTPException(status_code=504, detail="Timeout al consultar API climática")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener datos climáticos: {str(e)}")
