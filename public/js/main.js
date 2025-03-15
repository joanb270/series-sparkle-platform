
// Importar módulos
import { renderGenres, initFilters, renderContentGrid } from './filters.js';
import { setupSearch } from './search.js';
import { renderFavorites } from './favorites.js';
import { initPagination, loadTrendingContent } from './pagination.js';
import { getImageUrl } from './api.js';

// Estado global de la aplicación
window.allContent = [];
window.isOnline = navigator.onLine;

// Registrar el Service Worker
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registrado con éxito:', registration.scope);
      
      // Enviar datos de trending al Service Worker para cachear cuando estén disponibles
      navigator.serviceWorker.ready.then(registration => {
        if (window.allContent && window.allContent.length > 0) {
          const trendingUrls = [];
          
          // Recopilar URLs de imágenes para pre-cachear
          window.allContent.forEach(item => {
            if (item.poster_path) {
              trendingUrls.push(getImageUrl(item.poster_path));
            }
            if (item.backdrop_path) {
              trendingUrls.push(getImageUrl(item.backdrop_path, 'original'));
            }
          });
          
          // Enviar datos y URLs al Service Worker
          registration.active.postMessage({
            type: 'CACHE_TRENDING_DATA',
            trendingData: { results: window.allContent },
            trendingUrls: trendingUrls
          });
        }
      });
    } catch (error) {
      console.error('Error al registrar el Service Worker:', error);
    }
  }
};

// Manejo de estado online/offline
const handleConnectionChange = () => {
  const networkStatusElement = document.getElementById('networkStatus');
  if (!networkStatusElement) return;
  
  if (navigator.onLine) {
    window.isOnline = true;
    networkStatusElement.textContent = '';
    networkStatusElement.classList.add('d-none');
    console.log('Aplicación en línea');
  } else {
    window.isOnline = false;
    networkStatusElement.textContent = '📱 Modo sin conexión - Mostrando contenido guardado';
    networkStatusElement.classList.remove('d-none');
    console.log('Aplicación fuera de línea - usando datos en caché');
  }
};

// Inicialización de la página principal
const initHomePage = async () => {
  // Registrar Service Worker
  await registerServiceWorker();
  
  // Configurar manejo de conexión
  window.addEventListener('online', handleConnectionChange);
  window.addEventListener('offline', handleConnectionChange);
  handleConnectionChange(); // Estado inicial
  
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
    registerServiceWorker();
    renderGenres();
    setupSearch();
    renderFavorites();
    
    // Configurar manejo de conexión
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    handleConnectionChange(); // Estado inicial
  }
});
