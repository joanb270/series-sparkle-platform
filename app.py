
from flask import Flask, request, jsonify, send_from_directory
import requests
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__, static_folder='public')

# Configuración de TMDB
TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'c7f9f5bd40f5f95ebf63df8efcde3c46')  # Fallback a la clave pública para demo
TMDB_BASE_URL = "https://api.themoviedb.org/3"

def fetch_from_tmdb(endpoint, params=None):
    """Función auxiliar para hacer peticiones a TMDB"""
    url = f"{TMDB_BASE_URL}{endpoint}"
    
    # Parámetros por defecto
    default_params = {
        "api_key": TMDB_API_KEY,
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

# Endpoint para contenido en tendencia
@app.route('/api/trending')
def get_trending():
    data = fetch_from_tmdb("/trending/all/week")
    return jsonify(data)

# Endpoint para búsqueda
@app.route('/api/search')
def search():
    query = request.args.get('q', '')
    if not query:
        return jsonify({"error": "Se requiere un término de búsqueda"}), 400
    
    data = fetch_from_tmdb("/search/multi", {"query": query})
    if "error" in data:
        return jsonify(data), 500
    
    # Filtrar solo películas y series
    if "results" in data:
        data["results"] = [item for item in data["results"] 
                          if item.get("media_type") in ["movie", "tv"]]
    
    return jsonify(data)

# Endpoint para detalles de película o serie
@app.route('/api/details')
def get_details():
    content_type = request.args.get('type')
    content_id = request.args.get('id')
    
    if not content_type or not content_id:
        return jsonify({"error": "Se requieren los parámetros 'type' e 'id'"}), 400
    
    if content_type not in ['movie', 'tv']:
        return jsonify({"error": "El tipo debe ser 'movie' o 'tv'"}), 400
    
    data = fetch_from_tmdb(f"/{content_type}/{content_id}")
    return jsonify(data)

# Endpoint para episodios de una temporada
@app.route('/api/episodes')
def get_episodes():
    series_id = request.args.get('series_id')
    season = request.args.get('season', '1')
    
    if not series_id:
        return jsonify({"error": "Se requiere el parámetro 'series_id'"}), 400
    
    data = fetch_from_tmdb(f"/tv/{series_id}/season/{season}")
    return jsonify(data)

# Endpoint para recomendaciones
@app.route('/api/recommendations')
def get_recommendations():
    content_type = request.args.get('type')
    content_id = request.args.get('id')
    
    if not content_type or not content_id:
        return jsonify({"error": "Se requieren los parámetros 'type' e 'id'"}), 400
    
    if content_type not in ['movie', 'tv']:
        return jsonify({"error": "El tipo debe ser 'movie' o 'tv'"}), 400
    
    data = fetch_from_tmdb(f"/{content_type}/{content_id}/recommendations")
    
    # Asegurarse de que todos los resultados tengan media_type
    if "results" in data:
        for item in data["results"]:
            if "media_type" not in item:
                item["media_type"] = content_type
    
    return jsonify(data)

# Endpoint para videos (trailers, etc.)
@app.route('/api/videos')
def get_videos():
    content_type = request.args.get('type')
    content_id = request.args.get('id')
    
    if not content_type or not content_id:
        return jsonify({"error": "Se requieren los parámetros 'type' e 'id'"}), 400
    
    if content_type not in ['movie', 'tv']:
        return jsonify({"error": "El tipo debe ser 'movie' o 'tv'"}), 400
    
    data = fetch_from_tmdb(f"/{content_type}/{content_id}/videos")
    return jsonify(data)

# Endpoint para géneros
@app.route('/api/genres')
def get_genres():
    # Obtener géneros de películas y series
    movie_genres = fetch_from_tmdb("/genre/movie/list")
    tv_genres = fetch_from_tmdb("/genre/tv/list")
    
    # Combinar y eliminar duplicados
    all_genres = []
    genre_ids = set()
    
    if "genres" in movie_genres:
        for genre in movie_genres["genres"]:
            all_genres.append(genre)
            genre_ids.add(genre["id"])
    
    if "genres" in tv_genres:
        for genre in tv_genres["genres"]:
            if genre["id"] not in genre_ids:
                all_genres.append(genre)
    
    return jsonify({"genres": all_genres})

# Rutas especiales para las páginas principales
@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/favoritos')
def favorites():
    return send_from_directory(app.static_folder, 'favorites.html')

@app.route('/title')
def title():
    return send_from_directory(app.static_folder, 'title.html')

@app.route('/search')
def search_page():
    return send_from_directory(app.static_folder, 'search.html')

# Servir archivos estáticos desde la carpeta 'public'
@app.route('/<path:path>')
def serve_static(path):
    if path.startswith('api/'):
        # Evitar conflictos con las rutas de la API
        return jsonify({"error": "Endpoint no encontrado"}), 404
    
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
