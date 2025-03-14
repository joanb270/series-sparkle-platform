
# Backend Flask para Películas y Series

Este es un backend simple que sirve como proxy para la API de TMDB y proporciona acceso a datos de películas y series.

## Configuración

1. Clona este repositorio
2. Instala las dependencias:
   ```
   pip install -r requirements.txt
   ```
3. (Opcional) Crea un archivo `.env` con tu clave API de TMDB:
   ```
   TMDB_API_KEY=tu_clave_api_de_tmdb
   ```
   Si no proporcionas una clave API, se usará una clave pública para fines de demostración.

## Ejecución

Para ejecutar el servidor de desarrollo:
```
python app.py
```

El servidor estará disponible en http://localhost:5000

## Endpoints API disponibles

- `/api/trending` - Obtiene contenido en tendencia
- `/api/search?q={query}` - Busca películas y series
- `/api/details?type={type}&id={id}` - Obtiene detalles de una película o serie
- `/api/episodes?series_id={id}&season={season}` - Obtiene episodios de una temporada
- `/api/recommendations?type={type}&id={id}` - Obtiene recomendaciones
- `/api/videos?type={type}&id={id}` - Obtiene videos relacionados
- `/api/genres` - Obtiene todos los géneros disponibles

## Estructura de carpetas

El servidor sirve archivos estáticos desde la carpeta `public`. 
Para el frontend, coloca tus archivos HTML, CSS y JavaScript en esta carpeta.
