
from flask import jsonify, request, g
from datetime import datetime, timedelta
from functools import wraps
from models import db, User, Comment, ManualContent
from utils.auth import admin_required

# Endpoint para obtener estadísticas
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
@admin_required
def get_users():
    # Obtener todos los usuarios
    users = User.query.all()
    return jsonify({
        "success": True,
        "users": [user.to_dict() for user in users]
    })

# Endpoint para eliminar usuario
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
@admin_required
def get_all_comments():
    # Obtener todos los comentarios
    comments = Comment.query.order_by(Comment.created_at.desc()).all()
    return jsonify({
        "success": True,
        "comments": [comment.to_dict() for comment in comments]
    })

# Endpoint para eliminar comentario
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
@admin_required
def get_all_content():
    # Obtener todo el contenido manual
    content = ManualContent.query.order_by(ManualContent.created_at.desc()).all()
    return jsonify({
        "success": True,
        "content": [item.to_dict() for item in content]
    })

# Endpoint para agregar contenido manual
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
