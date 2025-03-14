
// Configuración y utilidades
const API_BASE_URL = '/api';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';
const DEFAULT_IMG = '/placeholder.svg';

// Cachear elementos DOM
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const contentGrid = document.getElementById('contentGrid');
const favoritesList = document.getElementById('favoritesList');
const favoritesSection = document.getElementById('favoritesSection');
const trendingCarousel = document.getElementById('trendingCarousel');
const genreDropdown = document.getElementById('genreDropdown');
const filters = document.getElementById('filters');
const genreFilters = document.getElementById('genreFilters');

// Estado de la aplicación
let allContent = [];
let genres = [];
let activeFilters = {
  type: 'all',
  genres: []
};

// Funciones utilitarias
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).getFullYear();
};

const getImageUrl = (path, size = 'w500') => {
  if (!path) return DEFAULT_IMG;
  return `${IMG_BASE_URL}/${size}${path}`;
};

const fetchAPI = async (endpoint, params = {}) => {
  try {
    // Construir URL con parámetros
    const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return { results: [] };
  }
};

// Funciones de favoritos
const getFavorites = () => {
  const favorites = localStorage.getItem('favorites');
  return favorites ? JSON.parse(favorites) : [];
};

const addToFavorites = (content) => {
  const favorites = getFavorites();
  const key = `${content.id}-${content.media_type}`;
  
  // Verificar si ya existe
  if (!favorites.some(item => `${item.id}-${item.media_type}` === key)) {
    favorites.push({
      id: content.id,
      title: content.title || content.name,
      poster_path: content.poster_path,
      media_type: content.media_type,
      year: formatDate(content.release_date || content.first_air_date)
    });
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
  
  renderFavorites();
  updateFavoriteButtons();
};

const removeFromFavorites = (id, type) => {
  const favorites = getFavorites();
  const updatedFavorites = favorites.filter(
    item => !(item.id === id && item.media_type === type)
  );
  localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  
  renderFavorites();
  updateFavoriteButtons();
};

const isInFavorites = (id, type) => {
  const favorites = getFavorites();
  return favorites.some(item => item.id === id && item.media_type === type);
};

const updateFavoriteButtons = () => {
  document.querySelectorAll('.favorite-toggle').forEach(btn => {
    const id = parseInt(btn.dataset.id);
    const type = btn.dataset.type;
    
    if (isInFavorites(id, type)) {
      btn.innerHTML = '<i class="bi bi-heart-fill"></i>';
      btn.classList.add('favorited');
    } else {
      btn.innerHTML = '<i class="bi bi-heart"></i>';
      btn.classList.remove('favorited');
    }
  });
};

// Renderizar elementos UI
const renderContentCard = (item) => {
  const title = item.title || item.name;
  const date = formatDate(item.release_date || item.first_air_date);
  const posterUrl = getImageUrl(item.poster_path);
  const mediaType = item.media_type === 'movie' ? 'Película' : 'Serie';
  
  return `
    <div class="col">
      <div class="content-card h-100">
        <span class="badge bg-danger media-type-badge">${mediaType}</span>
        <a href="/title?id=${item.id}&type=${item.media_type}">
          <img src="${posterUrl}" class="card-img-top" alt="${title}">
        </a>
        <button class="favorite-btn favorite-toggle" data-id="${item.id}" data-type="${item.media_type}">
          <i class="bi bi-heart"></i>
        </button>
        <div class="card-body p-2">
          <h6 class="content-title mb-1" title="${title}">${title}</h6>
          <small class="text-muted">${date}</small>
        </div>
      </div>
    </div>
  `;
};

const renderTrendingCarousel = (items) => {
  const carouselItems = items.slice(0, 5).map((item, index) => {
    const title = item.title || item.name;
    const overview = item.overview ? 
      (item.overview.length > 150 ? item.overview.substring(0, 150) + '...' : item.overview) : 
      'No hay descripción disponible';
    const backdropUrl = getImageUrl(item.backdrop_path, 'original');
    
    return `
      <div class="carousel-item ${index === 0 ? 'active' : ''}" 
           style="background-image: url('${backdropUrl}')">
        <div class="carousel-caption">
          <h2>${title}</h2>
          <p class="d-none d-md-block">${overview}</p>
          <a href="/title?id=${item.id}&type=${item.media_type}" class="btn btn-danger">Ver detalles</a>
        </div>
      </div>
    `;
  }).join('');
  
  trendingCarousel.innerHTML = carouselItems;
};

const renderFavorites = () => {
  const favorites = getFavorites();
  
  if (favorites.length > 0) {
    favoritesSection.classList.remove('d-none');
    favoritesList.innerHTML = favorites.map(item => {
      return `
        <div class="col">
          <div class="content-card h-100">
            <span class="badge bg-danger media-type-badge">
              ${item.media_type === 'movie' ? 'Película' : 'Serie'}
            </span>
            <a href="/title?id=${item.id}&type=${item.media_type}">
              <img src="${getImageUrl(item.poster_path)}" class="card-img-top" alt="${item.title}">
            </a>
            <button class="favorite-btn favorite-toggle" data-id="${item.id}" data-type="${item.media_type}">
              <i class="bi bi-heart-fill"></i>
            </button>
            <div class="card-body p-2">
              <h6 class="content-title mb-1" title="${item.title}">${item.title}</h6>
              <small class="text-muted">${item.year || 'N/A'}</small>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } else {
    favoritesSection.classList.add('d-none');
  }
  
  // Asignar eventos a los botones de favoritos
  document.querySelectorAll('.favorite-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = parseInt(btn.dataset.id);
      const type = btn.dataset.type;
      
      if (isInFavorites(id, type)) {
        removeFromFavorites(id, type);
      } else {
        // Buscar el contenido en allContent o en favoritos
        const content = allContent.find(item => item.id === id && item.media_type === type);
        if (content) {
          addToFavorites(content);
        }
      }
    });
  });
};

const renderContentGrid = () => {
  let filteredContent = [...allContent];
  
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

const renderGenres = async () => {
  try {
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

// Búsqueda
const setupSearch = () => {
  if (!searchInput) return;
  
  let searchTimeout;
  
  searchInput.addEventListener('focus', () => {
    searchResults.style.display = 'block';
  });
  
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const query = searchInput.value.trim();
    
    if (query.length >= 2) {
      searchTimeout = setTimeout(async () => {
        try {
          const data = await fetchAPI('/search', { q: query });
          
          if (data.results && data.results.length > 0) {
            const resultsHtml = data.results.slice(0, 5).map(item => {
              const title = item.title || item.name;
              const year = formatDate(item.release_date || item.first_air_date);
              const posterUrl = getImageUrl(item.poster_path, 'w92');
              
              return `
                <a href="/title?id=${item.id}&type=${item.media_type}" class="dropdown-item search-result-item">
                  <img src="${posterUrl}" alt="${title}">
                  <div>
                    <div class="fw-medium">${title}</div>
                    <small class="text-muted">${item.media_type === 'movie' ? 'Película' : 'Serie'} • ${year}</small>
                  </div>
                </a>
              `;
            }).join('');
            
            searchResults.innerHTML = `
              ${resultsHtml}
              <div class="dropdown-divider"></div>
              <a href="/search?q=${encodeURIComponent(query)}" class="dropdown-item text-center text-primary">
                Ver todos los resultados
              </a>
            `;
            searchResults.style.display = 'block';
          } else {
            searchResults.innerHTML = `
              <span class="dropdown-item">No se encontraron resultados</span>
            `;
          }
        } catch (error) {
          console.error('Error searching:', error);
        }
      }, 500);
    } else {
      searchResults.style.display = 'none';
    }
  });
  
  // Cerrar resultados si se hace clic fuera
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });
};

// Inicialización
const initFilters = () => {
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

const initHomePage = async () => {
  // Cargar géneros
  await renderGenres();
  
  // Cargar contenido trending
  const trendingData = await fetchAPI('/trending');
  if (trendingData.results && trendingData.results.length > 0) {
    renderTrendingCarousel(trendingData.results);
    allContent = trendingData.results;
    renderContentGrid();
  }
  
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
  if (contentGrid) {
    initHomePage();
  } else {
    // Para otras páginas, solo cargar componentes comunes
    renderGenres();
    setupSearch();
    renderFavorites();
  }
});
