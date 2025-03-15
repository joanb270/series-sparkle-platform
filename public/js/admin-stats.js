
// Módulo de estadísticas para el panel de administración

// Elementos del DOM
const usersCount = document.getElementById('usersCount');
const commentsCount = document.getElementById('commentsCount');
const contentCount = document.getElementById('contentCount');

// Elementos de gráficas
const usersPieChart = document.getElementById('usersPieChart');
const commentsLineChart = document.getElementById('commentsLineChart');

// Estado global
let charts = {
    usersPie: null,
    commentsLine: null
};

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
        adminCore.showAlert('Error al cargar estadísticas. Por favor, intenta de nuevo.', 'danger');
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

// Exponemos las funciones
const adminStats = {
    loadDashboardStats
};

// Exportamos el módulo
window.adminStats = adminStats;
