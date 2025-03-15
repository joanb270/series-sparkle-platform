
from flask import request, jsonify, current_app
from models import db, User

# Endpoint para registro de usuarios
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
