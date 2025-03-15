
// Módulo central para la administración
// Contiene la lógica principal, inicialización y autenticación

// Elementos del DOM
const authCheck = document.getElementById('authCheck');
const alertContainer = document.getElementById('alertContainer');
const logoutBtn = document.getElementById('logoutBtn');

// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    // Obtener token del localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        // No hay token, redirigir a la página principal
        window.location.href = '/';
        return;
    }
    
    try {
        // Verificar si el token es válido y si el usuario es admin
        const isAdmin = await checkAdminStatus(token);
        
        if (!isAdmin) {
            // El usuario no es administrador, mostrar mensaje y redirigir
            localStorage.setItem('adminRedirect', 'El acceso a esta página requiere permisos de administrador.');
            window.location.href = '/';
            return;
        }
        
        // Si llegamos aquí, el usuario es administrador
        // Ocultar pantalla de verificación
        authCheck.classList.add('d-none');
        
        // Inicializar la interfaz de administración
        initAdminInterface();
        
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        localStorage.removeItem('authToken');
        window.location.href = '/';
    }
});

// Verificar si el usuario es administrador
async function checkAdminStatus(token) {
    try {
        // Decodificar el token para ver el rol (sin hacer petición al servidor)
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        
        // Mostrar nombre de usuario en la interfaz
        document.getElementById('username').textContent = payload.username || 'Admin';
        document.getElementById('userInitial').textContent = (payload.username || 'A').substring(0, 1).toUpperCase();
        
        if (payload.role !== 'admin') {
            return false;
        }
        
        // Verificar con el servidor
        // Esto es opcional, pero añade una capa extra de seguridad
        const response = await fetch('/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('No autorizado');
        }
        
        return true;
    } catch (error) {
        console.error('Error al verificar estado de administrador:', error);
        return false;
    }
}

// Inicializar la interfaz de administración
function initAdminInterface() {
    // Cargar datos iniciales
    adminStats.loadDashboardStats();
    adminUsers.loadUsers();
    adminComments.loadComments();
    adminContent.loadContent();
    
    // Eventos de pestañas
    document.querySelectorAll('#adminTabs button').forEach(tab => {
        tab.addEventListener('click', function(event) {
            // Si se cambia a una pestaña, actualizar los datos
            const tabId = this.getAttribute('data-bs-target').substring(1);
            
            if (tabId === 'dashboard') {
                adminStats.loadDashboardStats();
            } else if (tabId === 'users') {
                adminUsers.loadUsers();
            } else if (tabId === 'comments') {
                adminComments.loadComments();
            } else if (tabId === 'content') {
                adminContent.loadContent();
            }
        });
    });
    
    // Evento para cerrar sesión
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        window.location.href = '/';
    });
}

// Obtener ID de usuario del token
function getUserIdFromToken() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        return payload.user_id;
    } catch (error) {
        console.error('Error al decodificar token:', error);
        return null;
    }
}

// Mostrar alerta
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Eliminar alerta después de 5 segundos
    setTimeout(() => {
        if (alert.parentNode) {
            alert.classList.remove('show');
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 300);
        }
    }, 5000);
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Exponemos las funciones a otros módulos
const adminCore = {
    showAlert,
    formatDate,
    getUserIdFromToken
};

// Exportamos el módulo
window.adminCore = adminCore;
