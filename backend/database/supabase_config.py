# backend/database/supabase_config.py
from supabase import create_client, Client
from dotenv import load_dotenv
import os

# Carga de variables desde el archivo .env
load_dotenv(dotenv_path="calorsos.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise EnvironmentError("❌ No se encontraron las variables SUPABASE_URL o SUPABASE_KEY en calorsos.env")

# Cliente global
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
