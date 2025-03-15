
from flask import Flask, jsonify, send_from_directory
import os
from dotenv import load_dotenv
from datetime import timedelta
import routes.content as content_routes
import routes.comments as comments_routes
import routes.auth as auth_routes
import routes.admin as admin_routes
import routes.views as views_routes
from models import db
from utils.tmdb import TMDB_BASE_URL

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__, static_folder='public')

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///seriessparkle.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'clave-secreta-desarrollo')
app.config['JWT_EXPIRATION_DELTA'] = timedelta(days=7)

# Inicializar la base de datos
db.init_app(app)

# Crear tablas en primer inicio
with app.app_context():
    db.create_all()

# Configuración de TMDB
global TMDB_API_KEY
TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'c7f9f5bd40f5f95ebf63df8efcde3c46')  # Fallback a la clave pública para demo

# ==================== ENDPOINTS DE CONTENIDO ====================
@app.route('/api/trending')
def get_trending():
    return content_routes.get_trending()

@app.route('/api/search')
def search():
    return content_routes.search()

@app.route('/api/details')
def get_details():
    return content_routes.get_details()

@app.route('/api/episodes')
def get_episodes():
    return content_routes.get_episodes()

@app.route('/api/recommendations')
def get_recommendations():
    return content_routes.get_recommendations()

@app.route('/api/videos')
def get_videos():
    return content_routes.get_videos()

@app.route('/api/genres')
def get_genres():
    return content_routes.get_genres()

# ==================== ENDPOINTS DE COMENTARIOS ====================
@app.route('/api/comments', methods=['GET'])
def get_comments():
    return comments_routes.get_comments()

@app.route('/api/comments', methods=['POST'])
def add_comment():
    return comments_routes.add_comment()

# ==================== ENDPOINTS DE AUTENTICACIÓN ====================
@app.route('/api/auth/register', methods=['POST'])
def register():
    return auth_routes.register()

@app.route('/api/auth/login', methods=['POST'])
def login():
    return auth_routes.login()

# ==================== ENDPOINTS DE ADMINISTRACIÓN ====================
@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    return admin_routes.get_admin_stats()

@app.route('/api/admin/users', methods=['GET'])
def get_users():
    return admin_routes.get_users()

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    return admin_routes.delete_user(user_id)

@app.route('/api/admin/users/<int:user_id>/role', methods=['PATCH'])
def update_user_role(user_id):
    return admin_routes.update_user_role(user_id)

@app.route('/api/admin/comments', methods=['GET'])
def get_all_comments():
    return admin_routes.get_all_comments()

@app.route('/api/admin/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    return admin_routes.delete_comment(comment_id)

@app.route('/api/admin/content', methods=['GET'])
def get_all_content():
    return admin_routes.get_all_content()

@app.route('/api/admin/content', methods=['POST'])
def add_content():
    return admin_routes.add_content()

@app.route('/api/admin/content/<int:content_id>', methods=['PUT'])
def update_content(content_id):
    return admin_routes.update_content(content_id)

@app.route('/api/admin/content/<int:content_id>', methods=['DELETE'])
def delete_content(content_id):
    return admin_routes.delete_content(content_id)

# ==================== RUTAS DE VISTAS ====================
@app.route('/')
def home():
    return views_routes.home(app)

@app.route('/favoritos')
def favorites():
    return views_routes.favorites(app)

@app.route('/title')
def title():
    return views_routes.title(app)

@app.route('/search')
def search_page():
    return views_routes.search_page(app)

@app.route('/admin')
def admin_page():
    return views_routes.admin_page(app)

@app.route('/<path:path>')
def serve_static(path):
    if path.startswith('api/'):
        # Evitar conflictos con las rutas de la API
        return jsonify({"error": "Endpoint no encontrado"}), 404
    
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
