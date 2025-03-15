
// Módulo de gestión de contenido para el panel de administración

// Elementos del DOM
const contentTable = document.getElementById('contentTable').querySelector('tbody');
const contentForm = document.getElementById('contentForm');
const newContentBtn = document.getElementById('newContentBtn');
const saveContentBtn = document.getElementById('saveContentBtn');

// Elementos modales
const contentModal = new bootstrap.Modal(document.getElementById('contentModal'));

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
                <td>${adminCore.formatDate(content.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-light me-1" onclick="adminContent.openEditContentModal(${content.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminCommon.openDeleteModal('content', ${content.id}, '${content.title}')">
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
        adminCore.showAlert('Error al cargar contenido. Por favor, intenta de nuevo.', 'danger');
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
        adminCore.showAlert('Error al cargar datos del contenido. Por favor, intenta de nuevo.', 'danger');
    }
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
            adminCore.showAlert('Por favor, completa todos los campos requeridos.', 'warning');
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
        adminStats.loadDashboardStats();
        
        adminCore.showAlert(`El contenido ha sido ${contentId ? 'actualizado' : 'agregado'} correctamente.`, 'success');
        
    } catch (error) {
        console.error('Error al guardar contenido:', error);
        adminCore.showAlert('Error al guardar el contenido. Por favor, intenta de nuevo.', 'danger');
    }
}

// Eventos
document.addEventListener('DOMContentLoaded', () => {
    // Evento para agregar nuevo contenido
    newContentBtn.addEventListener('click', () => {
        // Limpiar formulario
        contentForm.reset();
        document.getElementById('contentId').value = '';
        document.getElementById('contentModalLabel').textContent = 'Agregar Contenido';
    });
    
    // Evento para guardar contenido
    saveContentBtn.addEventListener('click', saveContent);
});

// Exponemos las funciones
const adminContent = {
    loadContent,
    openEditContentModal,
    saveContent
};

// Exportamos el módulo
window.adminContent = adminContent;
