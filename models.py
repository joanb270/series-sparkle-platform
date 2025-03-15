
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import jwt
import os
from flask import current_app
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación con comentarios
    comments = db.relationship('Comment', backref='author', lazy=True)
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def generate_token(self):
        payload = {
            'user_id': self.id,
            'username': self.username,
            'exp': datetime.utcnow() + current_app.config.get('JWT_EXPIRATION_DELTA')
        }
        token = jwt.encode(
            payload,
            current_app.config.get('SECRET_KEY'),
            algorithm='HS256'
        )
        return token

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación con usuario
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Información del contenido
    content_id = db.Column(db.String(20), nullable=False)
    type = db.Column(db.String(10), nullable=False)  # 'movie' o 'tv'
    
    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'created_at': self.created_at.isoformat(),
            'user_id': self.user_id,
            'username': self.author.username,
            'content_id': self.content_id,
            'type': self.type
        }
