
from flask import request, jsonify
from utils.tmdb import fetch_from_tmdb

# Endpoint para contenido en tendencia
def get_trending():
    page = request.args.get('page', '1')
    media_type = request.args.get('media_type', 'all')  # 'all', 'movie', 'tv'
    time_window = request.args.get('time_window', 'week')  # 'day', 'week'
    genre = request.args.get('genre', '')
    
    # Validar media_type
    if media_type not in ['all', 'movie', 'tv']:
        media_type = 'all'
    
    # Validar time_window
    if time_window not in ['day', 'week']:
        time_window = 'week'
    
    # Preparar parámetros adicionales
    params = {'page': page}
    
    # Hacer petición a TMDB
    trending_data = fetch_from_tmdb(f"/trending/{media_type}/{time_window}", params)
    
    # Si hay género, filtrar resultados
    if genre and genre.isdigit():
        genre_id = int(genre)
        if 'results' in trending_data:
            filtered_results = []
            for item in trending_data['results']:
                if 'genre_ids' in item and genre_id in item['genre_ids']:
                    filtered_results.append(item)
            trending_data['results'] = filtered_results
            trending_data['total_results'] = len(filtered_results)
    
    return jsonify(trending_data)

# Endpoint para búsqueda
def search():
    query = request.args.get('query', '')
    page = request.args.get('page', '1')
    
    if not query:
        return jsonify({"error": "Se requiere el parámetro 'query'"}), 400
    
    # Hacer petición a TMDB
    search_data = fetch_from_tmdb("/search/multi", {
        'query': query,
        'page': page,
        'include_adult': 'false'
    })
    
    return jsonify(search_data)

# Endpoint para detalles de película o serie
def get_details():
    content_id = request.args.get('id')
    content_type = request.args.get('type', 'movie')  # 'movie' o 'tv'
    
    if not content_id:
        return jsonify({"error": "Se requiere el parámetro 'id'"}), 400
    
    # Validar content_type
    if content_type not in ['movie', 'tv']:
        content_type = 'movie'
    
    # Hacer petición a TMDB
    details_data = fetch_from_tmdb(f"/{content_type}/{content_id}", {
        'append_to_response': 'credits,videos,similar'
    })
    
    return jsonify(details_data)

# Endpoint para episodios de una temporada
def get_episodes():
    series_id = request.args.get('id')
    season_number = request.args.get('season', '1')
    
    if not series_id:
        return jsonify({"error": "Se requiere el parámetro 'id'"}), 400
    
    # Hacer petición a TMDB
    episodes_data = fetch_from_tmdb(f"/tv/{series_id}/season/{season_number}")
    
    return jsonify(episodes_data)

# Endpoint para recomendaciones
def get_recommendations():
    content_id = request.args.get('id')
    content_type = request.args.get('type', 'movie')  # 'movie' o 'tv'
    
    if not content_id:
        return jsonify({"error": "Se requiere el parámetro 'id'"}), 400
    
    # Validar content_type
    if content_type not in ['movie', 'tv']:
        content_type = 'movie'
    
    # Hacer petición a TMDB
    recommendations_data = fetch_from_tmdb(f"/{content_type}/{content_id}/recommendations")
    
    return jsonify(recommendations_data)

# Endpoint para videos (trailers, etc.)
def get_videos():
    content_id = request.args.get('id')
    content_type = request.args.get('type', 'movie')  # 'movie' o 'tv'
    
    if not content_id:
        return jsonify({"error": "Se requiere el parámetro 'id'"}), 400
    
    # Validar content_type
    if content_type not in ['movie', 'tv']:
        content_type = 'movie'
    
    # Hacer petición a TMDB
    videos_data = fetch_from_tmdb(f"/{content_type}/{content_id}/videos")
    
    return jsonify(videos_data)

# Endpoint para géneros
def get_genres():
    content_type = request.args.get('type', 'movie')  # 'movie' o 'tv'
    
    # Validar content_type
    if content_type not in ['movie', 'tv']:
        content_type = 'movie'
    
    # Hacer petición a TMDB
    genres_data = fetch_from_tmdb(f"/genre/{content_type}/list")
    
    return jsonify(genres_data)
