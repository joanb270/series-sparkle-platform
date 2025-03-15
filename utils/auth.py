
from flask import request, jsonify, g
from functools import wraps
import jwt
from models import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Buscar token en encabezados
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({"error": "Token de autenticación requerido"}), 401
        
        try:
            # Decodificar token
            payload = jwt.decode(
                token,
                current_app.config.get('SECRET_KEY'),
                algorithms=['HS256']
            )
            
            # Guardar información del usuario en el contexto global de Flask
            g.user_id = payload['user_id']
            g.username = payload['username']
            g.role = payload['role']
            
        except Exception as e:
            return jsonify({"error": "Token inválido o expirado", "details": str(e)}), 401
        
        return f(*args, **kwargs)
    
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token_result = token_required(lambda: None)()
        
        # Si hay un error en la validación del token, retornarlo
        if isinstance(token_result, tuple) and token_result[1] != 200:
            return token_result
        
        # Verificar si el usuario es administrador
        if g.role != 'admin':
            return jsonify({"error": "Se requieren privilegios de administrador"}), 403
        
        return f(*args, **kwargs)
    
    return decorated

# Importaciones que se necesitan dentro de las funciones
from flask import current_app
