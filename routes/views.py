
from flask import send_from_directory

# Rutas especiales para las páginas principales
def home(app):
    return send_from_directory(app.static_folder, 'index.html')

def favorites(app):
    return send_from_directory(app.static_folder, 'favorites.html')

def title(app):
    return send_from_directory(app.static_folder, 'title.html')

def search_page(app):
    return send_from_directory(app.static_folder, 'search.html')

def admin_page(app):
    return send_from_directory(app.static_folder, 'admin.html')

# Servir archivos estáticos desde la carpeta 'public'
def serve_static(path, app):
    if path.startswith('api/'):
        return {"error": "Endpoint no encontrado"}, 404
    
    return send_from_directory(app.static_folder, path)
