
// Módulo de administración
// Maneja la funcionalidad del panel de administración

// Elementos del DOM
const authCheck = document.getElementById('authCheck');
const alertContainer = document.getElementById('alertContainer');
const usersTable = document.getElementById('usersTable').querySelector('tbody');
const commentsTable = document.getElementById('commentsTable').querySelector('tbody');
const contentTable = document.getElementById('contentTable').querySelector('tbody');
const contentForm = document.getElementById('contentForm');
const roleForm = document.getElementById('roleForm');
const logoutBtn = document.getElementById('logoutBtn');

// Contadores de estadísticas
const usersCount = document.getElementById('usersCount');
const commentsCount = document.getElementById('commentsCount');
const contentCount = document.getElementById('contentCount');

// Elementos de gráficas
const usersPieChart = document.getElementById('usersPieChart');
const commentsLineChart = document.getElementById('commentsLineChart');

// Elementos modales
const contentModal = new bootstrap.Modal(document.getElementById('contentModal'));
const roleModal = new bootstrap.Modal(document.getElementById('roleModal'));
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

// Botones
const newContentBtn = document.getElementById('newContentBtn');
const saveContentBtn = document.getElementById('saveContentBtn');
const saveRoleBtn = document.getElementById('saveRoleBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Estado global
let charts = {
    usersPie: null,
    commentsLine: null
};

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
    loadDashboardStats();
    loadUsers();
    loadComments();
    loadContent();
    
    // Eventos de pestañas
    document.querySelectorAll('#adminTabs button').forEach(tab => {
        tab.addEventListener('click', function(event) {
            // Si se cambia a una pestaña, actualizar los datos
            const tabId = this.getAttribute('data-bs-target').substring(1);
            
            if (tabId === 'dashboard') {
                loadDashboardStats();
            } else if (tabId === 'users') {
                loadUsers();
            } else if (tabId === 'comments') {
                loadComments();
            } else if (tabId === 'content') {
                loadContent();
            }
        });
    });
    
    // Evento para agregar nuevo contenido
    newContentBtn.addEventListener('click', () => {
        // Limpiar formulario
        contentForm.reset();
        document.getElementById('contentId').value = '';
        document.getElementById('contentModalLabel').textContent = 'Agregar Contenido';
    });
    
    // Evento para guardar contenido
    saveContentBtn.addEventListener('click', saveContent);
    
    // Evento para guardar rol
    saveRoleBtn.addEventListener('click', saveUserRole);
    
    // Evento para confirmar eliminación
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    
    // Evento para cerrar sesión
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        window.location.href = '/';
    });
}

// Cargar estadísticas del dashboard
async function loadDashboardStats() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar estadísticas');
        }
        
        const data = await response.json();
        
        // Actualizar contadores
        usersCount.textContent = data.stats.users.total;
        commentsCount.textContent = data.stats.comments.total;
        contentCount.textContent = data.stats.content.total;
        
        // Actualizar gráficas
        updateUsersPieChart(data.stats.users);
        updateCommentsLineChart(data.stats.comments.recent);
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        showAlert('Error al cargar estadísticas. Por favor, intenta de nuevo.', 'danger');
    }
}

// Actualizar gráfica de distribución de usuarios
function updateUsersPieChart(usersData) {
    // Destruir gráfica existente si hay una
    if (charts.usersPie) {
        charts.usersPie.destroy();
    }
    
    // Crear nueva gráfica
    charts.usersPie = new Chart(usersPieChart, {
        type: 'pie',
        data: {
            labels: ['Administradores', 'Usuarios Regulares'],
            datasets: [{
                data: [usersData.admin, usersData.regular],
                backgroundColor: ['#e50914', '#2c2c2c'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#f5f5f5'
                    }
                }
            }
        }
    });
}

// Actualizar gráfica de comentarios por día
function updateCommentsLineChart(commentsData) {
    // Preparar datos para la gráfica
    const dates = Object.keys(commentsData).sort();
    const counts = dates.map(date => commentsData[date]);
    
    // Destruir gráfica existente si hay una
    if (charts.commentsLine) {
        charts.commentsLine.destroy();
    }
    
    // Crear nueva gráfica
    charts.commentsLine = new Chart(commentsLineChart, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Comentarios',
                data: counts,
                borderColor: '#e50914',
                backgroundColor: 'rgba(229, 9, 20, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#b3b3b3',
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#b3b3b3'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Cargar lista de usuarios
async function loadUsers() {
    try {
        // Mostrar spinner
        usersTable.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="spinner-border text-danger" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>
        `;
        
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar usuarios');
        }
        
        const data = await response.json();
        
        if (!data.users || data.users.length === 0) {
            usersTable.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No hay usuarios registrados</td>
                </tr>
            `;
            return;
        }
        
        // Llenar tabla
        usersTable.innerHTML = data.users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>
                    <span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-secondary'}">${user.role}</span>
                </td>
                <td>${formatDate(user.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-light me-1" onclick="openRoleModal(${user.id}, '${user.role}')" ${user.id === getUserIdFromToken() ? 'disabled' : ''}>
                        <i class="bi bi-person-badge"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="openDeleteModal('user', ${user.id}, '${user.username}')" ${user.id === getUserIdFromToken() ? 'disabled' : ''}>
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        usersTable.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">Error al cargar usuarios</td>
            </tr>
        `;
        showAlert('Error al cargar usuarios. Por favor, intenta de nuevo.', 'danger');
    }
}

// Cargar lista de comentarios
async function loadComments() {
    try {
        // Mostrar spinner
        commentsTable.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="spinner-border text-danger" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>
        `;
        
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/admin/comments', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar comentarios');
        }
        
        const data = await response.json();
        
        if (!data.comments || data.comments.length === 0) {
            commentsTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No hay comentarios registrados</td>
                </tr>
            `;
            return;
        }
        
        // Llenar tabla
        commentsTable.innerHTML = data.comments.map(comment => `
            <tr>
                <td>${comment.id}</td>
                <td>${comment.username}</td>
                <td>${comment.content_id}</td>
                <td>
                    <span class="badge ${comment.type === 'movie' ? 'bg-primary' : 'bg-success'}">${comment.type}</span>
                </td>
                <td>
                    <div class="text-truncate" style="max-width: 200px;" title="${comment.text}">
                        ${comment.text}
                    </div>
                </td>
                <td>${formatDate(comment.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="openDeleteModal('comment', ${comment.id}, 'comentario')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error al cargar comentarios:', error);
        commentsTable.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">Error al cargar comentarios</td>
            </tr>
        `;
        showAlert('Error al cargar comentarios. Por favor, intenta de nuevo.', 'danger');
    }
}

// Cargar lista de contenido
async function loadContent() {
    try {
        // Mostrar spinner
        contentTable.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="spinner-border text-danger" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>
        `;
        
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/admin/content', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar contenido');
        }
        
        const data = await response.json();
        
        if (!data.content || data.content.length === 0) {
            contentTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No hay contenido registrado</td>
                </tr>
            `;
            return;
        }
        
        // Llenar tabla
        contentTable.innerHTML = data.content.map(content => `
            <tr>
                <td>${content.id}</td>
                <td>${content.title}</td>
                <td>
                    <span class="badge ${content.type === 'movie' ? 'bg-primary' : 'bg-success'}">${content.type}</span>
                </td>
                <td>${content.tmdb_id}</td>
                <td>
                    <div class="text-truncate" style="max-width: 150px;" title="${content.video_url || ''}">
                        ${content.video_url || 'N/A'}
                    </div>
                </td>
                <td>${formatDate(content.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-light me-1" onclick="openEditContentModal(${content.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="openDeleteModal('content', ${content.id}, '${content.title}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error al cargar contenido:', error);
        contentTable.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">Error al cargar contenido</td>
            </tr>
        `;
        showAlert('Error al cargar contenido. Por favor, intenta de nuevo.', 'danger');
    }
}

// Abrir modal para editar contenido
async function openEditContentModal(contentId) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/admin/content/${contentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar contenido');
        }
        
        const data = await response.json();
        const content = data.content;
        
        // Llenar formulario
        document.getElementById('contentId').value = content.id;
        document.getElementById('contentTitle').value = content.title;
        document.getElementById('contentType').value = content.type;
        document.getElementById('contentTmdbId').value = content.tmdb_id;
        document.getElementById('contentVideoUrl').value = content.video_url || '';
        
        // Cambiar título del modal
        document.getElementById('contentModalLabel').textContent = 'Editar Contenido';
        
        // Abrir modal
        contentModal.show();
        
    } catch (error) {
        console.error('Error al abrir modal de edición:', error);
        showAlert('Error al cargar datos del contenido. Por favor, intenta de nuevo.', 'danger');
    }
}

// Abrir modal para cambiar rol
function openRoleModal(userId, currentRole) {
    document.getElementById('roleUserId').value = userId;
    document.getElementById('userRole').value = currentRole;
    roleModal.show();
}

// Abrir modal para confirmar eliminación
function openDeleteModal(type, id, name) {
    // Tipo: 'user', 'comment', 'content'
    document.getElementById('deleteId').value = id;
    document.getElementById('deleteType').value = type;
    
    let message = '';
    if (type === 'user') {
        message = `¿Estás seguro de que deseas eliminar al usuario "${name}"?`;
    } else if (type === 'comment') {
        message = '¿Estás seguro de que deseas eliminar este comentario?';
    } else if (type === 'content') {
        message = `¿Estás seguro de que deseas eliminar el contenido "${name}"?`;
    }
    
    document.getElementById('deleteMessage').textContent = message;
    deleteModal.show();
}

// Guardar contenido (nuevo o editar)
async function saveContent() {
    try {
        // Obtener datos del formulario
        const contentId = document.getElementById('contentId').value;
        const title = document.getElementById('contentTitle').value;
        const type = document.getElementById('contentType').value;
        const tmdbId = document.getElementById('contentTmdbId').value;
        const videoUrl = document.getElementById('contentVideoUrl').value;
        
        // Validar datos
        if (!title || !type || !tmdbId) {
            showAlert('Por favor, completa todos los campos requeridos.', 'warning');
            return;
        }
        
        const token = localStorage.getItem('authToken');
        let url = '/api/admin/content';
        let method = 'POST';
        
        // Si hay ID, es edición
        if (contentId) {
            url = `/api/admin/content/${contentId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                type,
                tmdb_id: tmdbId,
                video_url: videoUrl
            })
        });
        
        if (!response.ok) {
            throw new Error('Error al guardar contenido');
        }
        
        // Cerrar modal y recargar lista
        contentModal.hide();
        loadContent();
        loadDashboardStats();
        
        showAlert(`El contenido ha sido ${contentId ? 'actualizado' : 'agregado'} correctamente.`, 'success');
        
    } catch (error) {
        console.error('Error al guardar contenido:', error);
        showAlert('Error al guardar el contenido. Por favor, intenta de nuevo.', 'danger');
    }
}

// Guardar cambio de rol
async function saveUserRole() {
    try {
        // Obtener datos del formulario
        const userId = document.getElementById('roleUserId').value;
        const role = document.getElementById('userRole').value;
        
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                role
            })
        });
        
        if (!response.ok) {
            throw new Error('Error al cambiar rol');
        }
        
        // Cerrar modal y recargar lista
        roleModal.hide();
        loadUsers();
        loadDashboardStats();
        
        showAlert('El rol ha sido actualizado correctamente.', 'success');
        
    } catch (error) {
        console.error('Error al cambiar rol:', error);
        showAlert('Error al cambiar el rol. Por favor, intenta de nuevo.', 'danger');
    }
}

// Confirmar eliminación
async function confirmDelete() {
    try {
        const id = document.getElementById('deleteId').value;
        const type = document.getElementById('deleteType').value;
        
        let url = '';
        if (type === 'user') {
            url = `/api/admin/users/${id}`;
        } else if (type === 'comment') {
            url = `/api/admin/comments/${id}`;
        } else if (type === 'content') {
            url = `/api/admin/content/${id}`;
        }
        
        const token = localStorage.getItem('authToken');
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error al eliminar ${type}`);
        }
        
        // Cerrar modal
        deleteModal.hide();
        
        // Recargar lista según el tipo
        if (type === 'user') {
            loadUsers();
        } else if (type === 'comment') {
            loadComments();
        } else if (type === 'content') {
            loadContent();
        }
        
        // Actualizar estadísticas
        loadDashboardStats();
        
        showAlert('El elemento ha sido eliminado correctamente.', 'success');
        
    } catch (error) {
        console.error('Error al eliminar:', error);
        showAlert('Error al eliminar. Por favor, intenta de nuevo.', 'danger');
    }
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

// Exponer funciones al ámbito global para los eventos onclick
window.openRoleModal = openRoleModal;
window.openDeleteModal = openDeleteModal;
window.openEditContentModal = openEditContentModal;
