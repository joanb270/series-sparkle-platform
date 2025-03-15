
from flask import Flask, request, jsonify, send_from_directory, g
import requests
import os
from dotenv import load_dotenv
import jwt
from datetime import datetime, timedelta
from functools import wraps
from models import db, User, Comment, ManualContent

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

# Decorador para rutas que requieren autenticación
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split('Bearer ')[1]
        
        if not token:
            return jsonify({'error': 'Token no proporcionado'}), 401
        
        try:
            payload = jwt.decode(
                token, 
                app.config['SECRET_KEY'], 
                algorithms=['HS256']
            )
            g.user_id = payload.get('user_id')
            g.username = payload.get('username')
            g.role = payload.get('role', 'user')
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token inválido'}), 401
            
        return f(*args, **kwargs)
    return decorated

# Decorador para rutas que requieren rol de administrador
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Primero verificamos que el usuario esté autenticado
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split('Bearer ')[1]
        
        if not token:
            return jsonify({'error': 'Token no proporcionado'}), 401
        
        try:
            payload = jwt.decode(
                token, 
                app.config['SECRET_KEY'], 
                algorithms=['HS256']
            )
            g.user_id = payload.get('user_id')
            g.username = payload.get('username')
            g.role = payload.get('role', 'user')
            
            # Verificar si el usuario es administrador
            if g.role != 'admin':
                return jsonify({'error': 'Acceso denegado: se requiere rol de administrador'}), 403
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token inválido'}), 401
            
        return f(*args, **kwargs)
    return decorated

# Endpoint para contenido en tendencia
@app.route('/api/trending')
def get_trending():
    # ... keep existing code (tendencia endpoint)

# Endpoint para búsqueda
@app.route('/api/search')
def search():
    # ... keep existing code (búsqueda endpoint)

# Endpoint para detalles de película o serie
@app.route('/api/details')
def get_details():
    # ... keep existing code (detalles endpoint)

# Endpoint para episodios de una temporada
@app.route('/api/episodes')
def get_episodes():
    # ... keep existing code (episodios endpoint)

# Endpoint para recomendaciones
@app.route('/api/recommendations')
def get_recommendations():
    # ... keep existing code (recomendaciones endpoint)

# Endpoint para videos (trailers, etc.)
@app.route('/api/videos')
def get_videos():
    # ... keep existing code (videos endpoint)

# Endpoint para géneros
@app.route('/api/genres')
def get_genres():
    # ... keep existing code (géneros endpoint)

# Endpoint para comentarios - GET
@app.route('/api/comments', methods=['GET'])
def get_comments():
    content_id = request.args.get('id')
    content_type = request.args.get('type')
    
    if not content_id or not content_type:
        return jsonify({"error": "Se requieren los parámetros 'id' y 'type'"}), 400
    
    # Obtener comentarios de la base de datos
    comments = Comment.query.filter_by(
        content_id=content_id,
        type=content_type
    ).order_by(Comment.created_at.desc()).all()
    
    # Convertir a diccionarios
    comments_data = [comment.to_dict() for comment in comments]
    
    return jsonify({"comments": comments_data})

# Endpoint para comentarios - POST
@app.route('/api/comments', methods=['POST'])
@token_required
def add_comment():
    data = request.json
    
    if not data or not all(k in data for k in ('content_id', 'type', 'text')):
        return jsonify({"error": "Faltan datos requeridos"}), 400
    
    if not data['text'].strip():
        return jsonify({"error": "El comentario no puede estar vacío"}), 400
    
    # Crear nuevo comentario
    new_comment = Comment(
        text=data['text'].strip(),
        user_id=g.user_id,
        content_id=data['content_id'],
        type=data['type']
    )
    
    # Guardar en la base de datos
    db.session.add(new_comment)
    db.session.commit()
    
    return jsonify({"success": True, "comment": new_comment.to_dict()})

# Endpoint para registro de usuarios
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    
    if not data or not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({"error": "Faltan datos requeridos"}), 400
    
    # Verificar si el usuario o email ya existen
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Nombre de usuario ya registrado"}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email ya registrado"}), 400
    
    # Crear nuevo usuario
    new_user = User(
        username=data['username'],
        email=data['email']
    )
    new_user.set_password(data['password'])
    
    # Guardar en la base de datos
    db.session.add(new_user)
    db.session.commit()
    
    # Generar token
    token = new_user.generate_token()
    
    return jsonify({
        "success": True,
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "role": new_user.role
        },
        "token": token
    })

# Endpoint para login
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    
    if not data or not all(k in data for k in ('username', 'password')):
        return jsonify({"error": "Faltan datos requeridos"}), 400
    
    # Buscar usuario por nombre de usuario
    user = User.query.filter_by(username=data['username']).first()
    
    # Verificar si el usuario existe y la contraseña es correcta
    if not user or not user.check_password(data['password']):
        return jsonify({"error": "Credenciales inválidas"}), 401
    
    # Generar token
    token = user.generate_token()
    
    return jsonify({
        "success": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        },
        "token": token
    })

# ==================== ENDPOINTS DE ADMINISTRACIÓN ====================

# Endpoint para obtener estadísticas
@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    # Contar usuarios, comentarios y contenido
    users_count = User.query.count()
    comments_count = Comment.query.count()
    content_count = ManualContent.query.count()
    
    # Contar usuarios por rol
    admin_count = User.query.filter_by(role='admin').count()
    regular_user_count = User.query.filter_by(role='user').count()
    
    # Obtener número de comentarios por día (últimos 7 días)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_comments = Comment.query.filter(Comment.created_at >= seven_days_ago).all()
    
    # Agrupar por día
    comments_by_day = {}
    for comment in recent_comments:
        day = comment.created_at.strftime('%Y-%m-%d')
        if day in comments_by_day:
            comments_by_day[day] += 1
        else:
            comments_by_day[day] = 1
    
    return jsonify({
        "success": True,
        "stats": {
            "users": {
                "total": users_count,
                "admin": admin_count,
                "regular": regular_user_count
            },
            "comments": {
                "total": comments_count,
                "recent": comments_by_day
            },
            "content": {
                "total": content_count
            }
        }
    })

# Endpoint para gestión de usuarios
@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_users():
    # Obtener todos los usuarios
    users = User.query.all()
    return jsonify({
        "success": True,
        "users": [user.to_dict() for user in users]
    })

# Endpoint para eliminar usuario
@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    
    # No permitir eliminar al usuario que hace la petición
    if user.id == g.user_id:
        return jsonify({"error": "No puedes eliminar tu propio usuario"}), 400
    
    # Eliminar usuario
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({"success": True, "message": f"Usuario {user.username} eliminado correctamente"})

# Endpoint para actualizar rol de usuario
@app.route('/api/admin/users/<int:user_id>/role', methods=['PATCH'])
@admin_required
def update_user_role(user_id):
    data = request.json
    
    if not data or 'role' not in data:
        return jsonify({"error": "Se requiere el parámetro 'role'"}), 400
    
    if data['role'] not in ['user', 'admin']:
        return jsonify({"error": "El rol debe ser 'user' o 'admin'"}), 400
    
    user = User.query.get_or_404(user_id)
    
    # No permitir cambiar el rol del usuario que hace la petición
    if user.id == g.user_id:
        return jsonify({"error": "No puedes cambiar tu propio rol"}), 400
    
    # Actualizar rol
    user.role = data['role']
    db.session.commit()
    
    return jsonify({
        "success": True, 
        "message": f"Rol de {user.username} actualizado a {user.role}"
    })

# Endpoint para gestión de comentarios
@app.route('/api/admin/comments', methods=['GET'])
@admin_required
def get_all_comments():
    # Obtener todos los comentarios
    comments = Comment.query.order_by(Comment.created_at.desc()).all()
    return jsonify({
        "success": True,
        "comments": [comment.to_dict() for comment in comments]
    })

# Endpoint para eliminar comentario
@app.route('/api/admin/comments/<int:comment_id>', methods=['DELETE'])
@admin_required
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    
    # Eliminar comentario
    db.session.delete(comment)
    db.session.commit()
    
    return jsonify({
        "success": True, 
        "message": f"Comentario eliminado correctamente"
    })

# Endpoint para gestión de contenido manual
@app.route('/api/admin/content', methods=['GET'])
@admin_required
def get_all_content():
    # Obtener todo el contenido manual
    content = ManualContent.query.order_by(ManualContent.created_at.desc()).all()
    return jsonify({
        "success": True,
        "content": [item.to_dict() for item in content]
    })

# Endpoint para agregar contenido manual
@app.route('/api/admin/content', methods=['POST'])
@admin_required
def add_content():
    data = request.json
    
    if not data or not all(k in data for k in ('title', 'tmdb_id', 'type')):
        return jsonify({"error": "Faltan datos requeridos"}), 400
    
    # Validar tipo
    if data['type'] not in ['movie', 'tv']:
        return jsonify({"error": "El tipo debe ser 'movie' o 'tv'"}), 400
    
    # Crear nuevo contenido
    new_content = ManualContent(
        title=data['title'],
        tmdb_id=data['tmdb_id'],
        type=data['type'],
        video_url=data.get('video_url', '')
    )
    
    # Guardar en la base de datos
    db.session.add(new_content)
    db.session.commit()
    
    return jsonify({
        "success": True, 
        "content": new_content.to_dict()
    })

# Endpoint para actualizar contenido manual
@app.route('/api/admin/content/<int:content_id>', methods=['PUT'])
@admin_required
def update_content(content_id):
    data = request.json
    
    if not data:
        return jsonify({"error": "No se proporcionaron datos para actualizar"}), 400
    
    content = ManualContent.query.get_or_404(content_id)
    
    # Actualizar campos
    if 'title' in data:
        content.title = data['title']
    if 'tmdb_id' in data:
        content.tmdb_id = data['tmdb_id']
    if 'type' in data and data['type'] in ['movie', 'tv']:
        content.type = data['type']
    if 'video_url' in data:
        content.video_url = data['video_url']
    
    # Guardar cambios
    db.session.commit()
    
    return jsonify({
        "success": True, 
        "content": content.to_dict()
    })

# Endpoint para eliminar contenido manual
@app.route('/api/admin/content/<int:content_id>', methods=['DELETE'])
@admin_required
def delete_content(content_id):
    content = ManualContent.query.get_or_404(content_id)
    
    # Eliminar contenido
    db.session.delete(content)
    db.session.commit()
    
    return jsonify({
        "success": True, 
        "message": f"Contenido '{content.title}' eliminado correctamente"
    })

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

@app.route('/admin')
def admin_page():
    return send_from_directory(app.static_folder, 'admin.html')

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
