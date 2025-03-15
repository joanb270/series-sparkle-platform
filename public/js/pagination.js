
import { fetchAPI } from './api.js';
import { renderTrendingCarousel } from './carousel.js';
import { renderContentGrid } from './filters.js';

// Variables de estado para paginación
let currentPage = 1;
const itemsPerPage = 10;

// Función para cargar contenido con paginación
export const loadTrendingContent = async (page = 1) => {
  try {
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const currentPageSpan = document.getElementById('currentPage');
    
    if (!prevPageBtn || !nextPageBtn || !currentPageSpan) return;
    
    // Actualizar el estado de la paginación
    currentPage = page;
    currentPageSpan.textContent = currentPage;
    
    // Deshabilitar botón "Anterior" si estamos en la primera página
    if (currentPage === 1) {
      prevPageBtn.disabled = true;
      prevPageBtn.classList.add('disabled');
    } else {
      prevPageBtn.disabled = false;
      prevPageBtn.classList.remove('disabled');
    }
    
    // Cargar datos de la API con el parámetro de página
    const trendingData = await fetchAPI('/trending', { page: currentPage.toString() });
    
    if (trendingData.results && trendingData.results.length > 0) {
      // Limitar a itemsPerPage elementos
      const limitedResults = trendingData.results.slice(0, itemsPerPage);
      
      // Actualizar el contenido y el carrusel
      window.allContent = limitedResults;
      renderTrendingCarousel(limitedResults);
      renderContentGrid(); // Esto respetará los filtros activos
    }
  } catch (error) {
    console.error('Error loading trending content:', error);
  }
};

// Inicializar paginación
export const initPagination = () => {
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  
  if (!prevPageBtn || !nextPageBtn) return;
  
  // Botón "Anterior"
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      loadTrendingContent(currentPage - 1);
    }
  });
  
  // Botón "Siguiente"
  nextPageBtn.addEventListener('click', () => {
    loadTrendingContent(currentPage + 1);
  });
  
  // Inicialmente deshabilitar "Anterior" en la primera página
  prevPageBtn.disabled = true;
  prevPageBtn.classList.add('disabled');
};

// Exportar para acceso global
export { currentPage, itemsPerPage };
