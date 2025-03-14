
# SeriesSparkle - Plataforma de Streaming

Esta es una aplicación web de streaming que muestra películas y series de TV utilizando la API de TMDB. La aplicación está construida con Flask en el backend y Bootstrap 5 en el frontend.

## Características

- Diseño responsivo con tema oscuro y acentos rojos
- Página principal con carrusel de destacados, filtros de género y tipo
- Búsqueda con autocompletado
- Página de detalles con póster, descripción, episodios y recomendaciones
- Sistema de favoritos usando localStorage
- Backend en Flask que sirve como proxy para la API de TMDB

## Estructura de Archivos

```
├── app.py                # Backend Flask
├── requirements.txt      # Dependencias de Python
├── .env                  # Variables de entorno (crear basado en .env.example)
├── .env.example          # Ejemplo de configuración
├── public/               # Archivos estáticos
│   ├── index.html        # Página principal
│   ├── title.html        # Página de detalles de título
│   ├── search.html       # Página de resultados de búsqueda
│   ├── favorites.html    # Página de favoritos
│   ├── style.css         # Estilos CSS
│   ├── main.js           # JavaScript principal
│   └── title.js          # JavaScript para la página de detalles
```

## Requisitos

- Python 3.7+
- Flask
- Requests
- python-dotenv

## Instalación

1. Clona este repositorio:
   ```
   git clone https://github.com/your-username/series-sparkle.git
   cd series-sparkle
   ```

2. Instala las dependencias:
   ```
   pip install -r requirements.txt
   ```

3. Configura tu API key de TMDB:
   - Copia el archivo `.env.example` a `.env`
   - Reemplaza `tu_clave_api_de_tmdb_aqui` con tu API key de TMDB
   - Si no tienes una API key, la aplicación usará una clave pública para demostración

## Ejecución

Para ejecutar la aplicación localmente:

```
python app.py
```

La aplicación estará disponible en `http://localhost:5000`

## Despliegue

### Vercel

Para desplegar en Vercel:

1. Crea un archivo `vercel.json` en la raíz:
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "app.py", "use": "@vercel/python" }
     ],
     "routes": [
       { "src": "/(.*)", "dest": "/app.py" }
     ],
     "env": {
       "TMDB_API_KEY": "tu_clave_api_de_tmdb_aqui"
     }
   }
   ```

2. Sube tu proyecto a GitHub y conéctalo a Vercel

### Servidor LiteSpeed

Para desplegar en un servidor LiteSpeed:

1. Configura un entorno virtual Python:
   ```
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. Configura LiteSpeed para usar WSGI con Flask:
   ```
   lsapi-enable
   lsapi-python-path /ruta/a/tu/venv/bin/python
   lsapi-module app
   ```

## Atribuciones

- Desarrollado con [Flask](https://flask.palletsprojects.com/)
- Frontend construido con [Bootstrap 5](https://getbootstrap.com/)
- Datos de películas y series proporcionados por [TMDB API](https://www.themoviedb.org/documentation/api)
- Iconos de [Bootstrap Icons](https://icons.getbootstrap.com/)

## Licencia

Este proyecto es sólo para fines educativos. Todos los datos multimedia son obtenidos a través de la API de TMDB y pertenecen a sus respectivos propietarios.
