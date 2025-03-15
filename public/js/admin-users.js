
// Módulo de gestión de usuarios para el panel de administración

// Elementos del DOM
const usersTable = document.getElementById('usersTable').querySelector('tbody');

// Elementos modales
const roleModal = new bootstrap.Modal(document.getElementById('roleModal'));
const saveRoleBtn = document.getElementById('saveRoleBtn');

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
                <td>${adminCore.formatDate(user.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-light me-1" onclick="adminUsers.openRoleModal(${user.id}, '${user.role}')" ${user.id === adminCore.getUserIdFromToken() ? 'disabled' : ''}>
                        <i class="bi bi-person-badge"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminCommon.openDeleteModal('user', ${user.id}, '${user.username}')" ${user.id === adminCore.getUserIdFromToken() ? 'disabled' : ''}>
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
        adminCore.showAlert('Error al cargar usuarios. Por favor, intenta de nuevo.', 'danger');
    }
}

// Abrir modal para cambiar rol
function openRoleModal(userId, currentRole) {
    document.getElementById('roleUserId').value = userId;
    document.getElementById('userRole').value = currentRole;
    roleModal.show();
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
        adminStats.loadDashboardStats();
        
        adminCore.showAlert('El rol ha sido actualizado correctamente.', 'success');
        
    } catch (error) {
        console.error('Error al cambiar rol:', error);
        adminCore.showAlert('Error al cambiar el rol. Por favor, intenta de nuevo.', 'danger');
    }
}

// Eventos
document.addEventListener('DOMContentLoaded', () => {
    // Evento para guardar rol
    saveRoleBtn.addEventListener('click', saveUserRole);
});

// Exponemos las funciones
const adminUsers = {
    loadUsers,
    openRoleModal,
    saveUserRole
};

// Exportamos el módulo
window.adminUsers = adminUsers;
