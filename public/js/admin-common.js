
// Módulo de funciones comunes para el panel de administración

// Elementos modales
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

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
            adminUsers.loadUsers();
        } else if (type === 'comment') {
            adminComments.loadComments();
        } else if (type === 'content') {
            adminContent.loadContent();
        }
        
        // Actualizar estadísticas
        adminStats.loadDashboardStats();
        
        adminCore.showAlert('El elemento ha sido eliminado correctamente.', 'success');
        
    } catch (error) {
        console.error('Error al eliminar:', error);
        adminCore.showAlert('Error al eliminar. Por favor, intenta de nuevo.', 'danger');
    }
}

// Eventos
document.addEventListener('DOMContentLoaded', () => {
    // Evento para confirmar eliminación
    confirmDeleteBtn.addEventListener('click', confirmDelete);
});

// Exponemos las funciones
const adminCommon = {
    openDeleteModal,
    confirmDelete
};

// Exportamos el módulo
window.adminCommon = adminCommon;
