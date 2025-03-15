
import requests

# Configuración de TMDB
TMDB_BASE_URL = "https://api.themoviedb.org/3"

def fetch_from_tmdb(endpoint, params=None):
    """Función auxiliar para hacer peticiones a TMDB"""
    url = f"{TMDB_BASE_URL}{endpoint}"
    
    # Parámetros por defecto
    default_params = {
        "api_key": 3dca2956b66e0413c972243c868dc42a ,
        "language": "es-ES"  # Español por defecto
    }
    
    # Combinar parámetros
    if params:
        default_params.update(params)
    
    try:
        response = requests.get(url, params=default_params)
        response.raise_for_status()  # Lanzar excepción si hay error HTTP
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error en la petición a TMDB: {e}")
        return {"error": "Error al comunicarse con el servicio de películas", "details": str(e)}
