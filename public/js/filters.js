
import { fetchAPI } from './api.js';
import { renderContentCard } from './carousel.js';
import { updateFavoriteButtons } from './favorites.js';

// Variables de estado para filtros
let genres = [];
let activeFilters = {
  type: 'all',
  genres: []
};

// Renderizar contenido filtrado
export const renderContentGrid = () => {
  const contentGrid = document.getElementById('contentGrid');
  if (!contentGrid) return;
  
  let filteredContent = [...window.allContent];
  
  // Aplicar filtros de tipo
  if (activeFilters.type !== 'all') {
    filteredContent = filteredContent.filter(item => item.media_type === activeFilters.type);
  }
  
  // Aplicar filtros de género
  if (activeFilters.genres.length > 0) {
    filteredContent = filteredContent.filter(item => {
      if (!item.genre_ids || item.genre_ids.length === 0) return false;
      return item.genre_ids.some(genreId => activeFilters.genres.includes(genreId));
    });
  }
  
  // Renderizar el grid
  contentGrid.innerHTML = filteredContent.length > 0 
    ? filteredContent.map(renderContentCard).join('') 
    : '<div class="col-12 text-center py-5">No se encontraron resultados con los filtros seleccionados.</div>';
  
  updateFavoriteButtons();
};

// Cargar y renderizar géneros
export const renderGenres = async () => {
  try {
    const genreDropdown = document.getElementById('genreDropdown');
    const genreFilters = document.getElementById('genreFilters');
    
    const data = await fetchAPI('/genres');
    genres = data.genres || [];
    
    // Renderizar desplegable de géneros en la navbar
    if (genreDropdown) {
      genreDropdown.innerHTML = genres.map(genre => 
        `<li><a class="dropdown-item" href="/?genre=${genre.id}">${genre.name}</a></li>`
      ).join('');
    }
    
    // Renderizar botones de filtro de género
    if (genreFilters) {
      genreFilters.innerHTML = `
        <div class="dropdown">
          <button class="btn btn-sm btn-outline-light dropdown-toggle" type="button" 
                  data-bs-toggle="dropdown" aria-expanded="false">
            Géneros
          </button>
          <ul class="dropdown-menu dropdown-menu-dark p-2">
            <div class="d-flex flex-wrap gap-1">
              ${genres.map(genre => 
                `<button class="badge genre-filter" data-genre="${genre.id}">${genre.name}</button>`
              ).join('')}
            </div>
          </ul>
        </div>
      `;
      
      // Asignar eventos a los filtros de género
      document.querySelectorAll('.genre-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          const genreId = parseInt(btn.dataset.genre);
          const index = activeFilters.genres.indexOf(genreId);
          
          if (index === -1) {
            activeFilters.genres.push(genreId);
            btn.classList.add('bg-danger');
          } else {
            activeFilters.genres.splice(index, 1);
            btn.classList.remove('bg-danger');
          }
          
          renderContentGrid();
        });
      });
    }
  } catch (error) {
    console.error('Error fetching genres:', error);
  }
};

// Inicializar filtros
export const initFilters = () => {
  const filters = document.getElementById('filters');
  if (!filters) return;

  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      document.querySelectorAll('[data-filter]').forEach(b => 
        b.classList.remove('btn-danger', 'active') && b.classList.add('btn-outline-danger')
      );
      
      // Add active class to clicked button
      btn.classList.add('btn-danger', 'active');
      btn.classList.remove('btn-outline-danger');
      
      // Update active filter
      activeFilters.type = btn.dataset.filter;
      renderContentGrid();
    });
  });
};

// Exportar para acceso global
export { genres, activeFilters };
