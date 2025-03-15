
// Importar módulos
import { renderGenres, initFilters, renderContentGrid } from './filters.js';
import { setupSearch } from './search.js';
import { renderFavorites } from './favorites.js';
import { initPagination, loadTrendingContent } from './pagination.js';

// Estado global de la aplicación
window.allContent = [];

// Inicialización de la página principal
const initHomePage = async () => {
  // Cargar géneros
  await renderGenres();
  
  // Inicializar paginación
  initPagination();
  
  // Cargar contenido trending (primera página)
  await loadTrendingContent(1);
  
  // Configurar búsqueda
  setupSearch();
  
  // Configurar filtros
  initFilters();
  
  // Cargar favoritos
  renderFavorites();
  
  // Cerrar dropdowns al hacer clic fuera
  document.addEventListener('click', () => {
    const openDropdown = document.querySelector('.dropdown-menu.show');
    if (openDropdown) {
      openDropdown.classList.remove('show');
    }
  });
};

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si estamos en la página principal
  const contentGrid = document.getElementById('contentGrid');
  if (contentGrid) {
    initHomePage();
  } else {
    // Para otras páginas, solo cargar componentes comunes
    renderGenres();
    setupSearch();
    renderFavorites();
  }
});
