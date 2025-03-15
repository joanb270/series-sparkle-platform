
from flask import request, jsonify, g, current_app
from functools import wraps
import jwt

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
                current_app.config['SECRET_KEY'], 
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
                current_app.config['SECRET_KEY'], 
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
