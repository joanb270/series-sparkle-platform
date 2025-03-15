
from flask import request, jsonify, g
from models import db, Comment
from utils.auth import token_required

# Endpoint para comentarios - GET
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
