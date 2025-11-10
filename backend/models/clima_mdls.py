# backend/models/clima_mdls.py
from dotenv import load_dotenv
import requests
import os
from fastapi import HTTPException

# Cargar las variables de entorno desde el archivo calorsos.env
load_dotenv(dotenv_path="calorsos.env")

OPENWEATHER_API_KEY = os.getenv("KEY")

class ClimaModel:
    """Modelo para obtener datos climáticos desde la API de OpenWeatherMap."""

    @staticmethod
    def obtener_clima(ciudad: str = "Cartagena"):
        """Consulta la API de OpenWeatherMap para obtener el clima actual de una ciudad."""
        if not OPENWEATHER_API_KEY:
            raise HTTPException(status_code=500, detail="Falta la API Key de OpenWeatherMap en calorsos.env")

        try:
            url = (
                f"https://api.openweathermap.org/data/2.5/weather?"
                f"q={ciudad}&appid={OPENWEATHER_API_KEY}&units=metric&lang=es"
            )

            response = requests.get(url, timeout=10)
            data = response.json()

            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=data.get("message"))

            clima = {
                "ciudad": data.get("name"),
                "temperatura": data["main"]["temp"],
                "humedad": data["main"]["humidity"],
                "condicion": data["weather"][0]["description"],
            }

            return clima

        except requests.Timeout:
            raise HTTPException(status_code=504, detail="Timeout al consultar API climática")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al obtener datos climáticos: {str(e)}")
