
// Módulo de gestión de comentarios para el panel de administración

// Elementos del DOM
const commentsTable = document.getElementById('commentsTable').querySelector('tbody');

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
                <td>${adminCore.formatDate(comment.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminCommon.openDeleteModal('comment', ${comment.id}, 'comentario')">
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
        adminCore.showAlert('Error al cargar comentarios. Por favor, intenta de nuevo.', 'danger');
    }
}

// Exponemos las funciones
const adminComments = {
    loadComments
};

// Exportamos el módulo
window.adminComments = adminComments;
