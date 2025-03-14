
// Variables y estado
let contentId = null;
let contentType = null;
let contentDetails = null;
let currentSeason = 1;

// Elementos DOM
const contentPoster = document.getElementById('contentPoster');
const contentTitle = document.getElementById('contentTitle');
const titleName = document.getElementById('titleName');
const favoriteBtn = document.getElementById('favoriteBtn');
const contentOverview = document.getElementById('contentOverview');
const titleBanner = document.getElementById('titleBanner');
const genresList = document.getElementById('genresList');
const releaseYear = document.getElementById('releaseYear');
const contentRating = document.getElementById('contentRating');
const contentDuration = document.getElementById('contentDuration');
const contentTypeEl = document.getElementById('contentType');
const seasonSelector = document.getElementById('seasonSelector');
const episodesList = document.getElementById('episodesList');
const episodesSection = document.getElementById('episodesSection');
const videoPlayer = document.getElementById('videoPlayer');
const recommendationsList = document.getElementById('recommendationsList');

// Utilidades
const getIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  contentId = urlParams.get('id');
  contentType = urlParams.get('type') || 'movie';
  
  if (!contentId) {
    window.location.href = '/';
  }
};

const getImageUrl = (path, size = 'w500') => {
  if (!path) return '/placeholder.svg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

const formatRuntime = (minutes) => {
  if (!minutes) return 'Duración desconocida';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const formatStars = (rating) => {
  if (!rating) return '';
  const stars = Math.round(rating / 2);
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
};

const toggleFavorite = () => {
  if (!contentDetails) return;
  
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const key = `${contentDetails.id}-${contentType}`;
  const existingIndex = favorites.findIndex(
    item => `${item.id}-${item.media_type}` === key
  );
  
  if (existingIndex >= 0) {
    // Remove from favorites
    favorites.splice(existingIndex, 1);
    favoriteBtn.innerHTML = '<i class="bi bi-heart"></i>';
  } else {
    // Add to favorites
    favorites.push({
      id: contentDetails.id,
      title: contentDetails.title || contentDetails.name,
      poster_path: contentDetails.poster_path,
      media_type: contentType,
      year: contentDetails.release_date?.substring(0, 4) || 
            contentDetails.first_air_date?.substring(0, 4) || ''
    });
    favoriteBtn.innerHTML = '<i class="bi bi-heart-fill"></i>';
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
};

const isFavorite = () => {
  if (!contentDetails) return false;
  
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  return favorites.some(
    item => item.id === contentDetails.id && item.media_type === contentType
  );
};

// Renderizar UI
const renderContentDetails = () => {
  if (!contentDetails) return;
  
  // Actualizar elementos básicos
  document.title = `${contentDetails.title || contentDetails.name} - SeriesSparkle`;
  titleName.textContent = contentDetails.title || contentDetails.name;
  contentTitle.textContent = contentDetails.title || contentDetails.name;
  contentOverview.textContent = contentDetails.overview || 'No hay sinopsis disponible.';
  contentTypeEl.textContent = contentType === 'movie' ? 'Películas' : 'Series';
  
  // Imagen de portada y fondo
  contentPoster.src = getImageUrl(contentDetails.poster_path, 'w500');
  contentPoster.alt = contentDetails.title || contentDetails.name;
  titleBanner.style.backgroundImage = `url(${getImageUrl(contentDetails.backdrop_path, 'original')})`;
  
  // Año y duración
  releaseYear.textContent = contentDetails.release_date?.substring(0, 4) || 
                            contentDetails.first_air_date?.substring(0, 4) || 'N/A';
  
  // Duración (diferente para películas y series)
  if (contentType === 'movie') {
    contentDuration.textContent = formatRuntime(contentDetails.runtime);
  } else {
    const seasons = contentDetails.number_of_seasons || 0;
    const episodes = contentDetails.number_of_episodes || 0;
    contentDuration.textContent = `${seasons} temporada${seasons !== 1 ? 's' : ''}, ${episodes} episodio${episodes !== 1 ? 's' : ''}`;
  }
  
  // Puntuación
  contentRating.textContent = formatStars(contentDetails.vote_average);
  
  // Géneros
  genresList.innerHTML = contentDetails.genres?.map(genre => 
    `<a href="/?genre=${genre.id}" class="badge">${genre.name}</a>`
  ).join('') || '';
  
  // Estado de favoritos
  favoriteBtn.innerHTML = isFavorite() ? 
    '<i class="bi bi-heart-fill"></i>' : 
    '<i class="bi bi-heart"></i>';
  
  // Mostrar sección de episodios solo para series
  if (contentType === 'tv') {
    episodesSection.classList.remove('d-none');
    renderSeasons();
    loadEpisodes(currentSeason);
  } else {
    episodesSection.classList.add('d-none');
  }
};

const renderSeasons = () => {
  if (!contentDetails?.seasons || contentType !== 'tv') return;
  
  seasonSelector.innerHTML = contentDetails.seasons.map((season, index) => 
    `<option value="${season.season_number}">Temporada ${season.season_number}</option>`
  ).join('');
  
  // Seleccionar primera temporada por defecto
  currentSeason = contentDetails.seasons[0]?.season_number || 1;
  seasonSelector.value = currentSeason;
};

const renderEpisodes = (episodes) => {
  if (!episodes || episodes.length === 0) {
    episodesList.innerHTML = '<div class="col-12 text-center">No hay episodios disponibles.</div>';
    return;
  }
  
  episodesList.innerHTML = episodes.map(episode => {
    const stillUrl = episode.still_path ? 
      getImageUrl(episode.still_path, 'w300') : 
      '/placeholder.svg';
    
    return `
      <div class="col">
        <div class="episode-card" data-episode="${episode.episode_number}">
          <div class="row g-0">
            <div class="col-md-4">
              <img src="${stillUrl}" class="img-fluid episode-img" alt="Episodio ${episode.episode_number}">
            </div>
            <div class="col-md-8">
              <div class="p-3">
                <div class="d-flex align-items-center mb-1">
                  <span class="episode-number">${episode.episode_number}</span>
                  <h6 class="mb-0">${episode.name}</h6>
                </div>
                <small class="text-muted d-block mb-2">
                  ${episode.air_date ? new Date(episode.air_date).toLocaleDateString() : 'N/A'}
                </small>
                <p class="small mb-0 text-truncate">${episode.overview || 'No hay descripción disponible.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Asignar eventos a los episodios
  document.querySelectorAll('.episode-card').forEach(card => {
    card.addEventListener('click', () => {
      const episodeNumber = card.dataset.episode;
      simulatePlayEpisode(currentSeason, episodeNumber);
    });
  });
};

const renderRecommendations = (recommendations) => {
  if (!recommendations || recommendations.length === 0) {
    recommendationsList.innerHTML = '<div class="col-12 text-center">No hay recomendaciones disponibles.</div>';
    return;
  }
  
  recommendationsList.innerHTML = recommendations.slice(0, 6).map(item => {
    const posterUrl = getImageUrl(item.poster_path, 'w342');
    const title = item.title || item.name;
    const type = item.media_type || contentType;
    
    return `
      <div class="col">
        <div class="content-card h-100">
          <a href="/title?id=${item.id}&type=${type}">
            <img src="${posterUrl}" class="card-img-top" alt="${title}">
            <div class="card-body p-2">
              <h6 class="content-title mb-0" title="${title}">${title}</h6>
            </div>
          </a>
        </div>
      </div>
    `;
  }).join('');
};

// Simular reproducción
const simulatePlayEpisode = (season, episode) => {
  videoPlayer.innerHTML = `
    <div class="text-center">
      <h3 class="mb-4 mt-5">Reproduciendo</h3>
      <p>Temporada ${season}, Episodio ${episode}</p>
      <p class="mb-5">${contentDetails.name}</p>
      <div class="spinner-border text-danger" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 mb-5 text-muted">No hay contenido real disponible, esta es una demo</p>
    </div>
  `;
  
  // Scroll al reproductor
  videoPlayer.scrollIntoView({ behavior: 'smooth' });
};

const simulatePlayMovie = () => {
  videoPlayer.innerHTML = `
    <div class="text-center">
      <h3 class="mb-4 mt-5">Reproduciendo</h3>
      <p class="mb-5">${contentDetails.title || contentDetails.name}</p>
      <div class="spinner-border text-danger" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 mb-5 text-muted">No hay contenido real disponible, esta es una demo</p>
    </div>
  `;
};

// Fetching de datos
const fetchContentDetails = async () => {
  try {
    const response = await fetch(`/api/details?type=${contentType}&id=${contentId}`);
    if (!response.ok) throw new Error('Error fetching content details');
    
    contentDetails = await response.json();
    renderContentDetails();
    
    // Cargar recomendaciones
    fetchRecommendations();
  } catch (error) {
    console.error('Error:', error);
    // Manejar error de carga de contenido
  }
};

const loadEpisodes = async (seasonNumber) => {
  try {
    const response = await fetch(`/api/episodes?series_id=${contentId}&season=${seasonNumber}`);
    if (!response.ok) throw new Error('Error fetching episodes');
    
    const data = await response.json();
    renderEpisodes(data.episodes);
  } catch (error) {
    console.error('Error:', error);
    episodesList.innerHTML = '<div class="col-12 text-center">Error al cargar episodios.</div>';
  }
};

const fetchRecommendations = async () => {
  try {
    const response = await fetch(`/api/recommendations?type=${contentType}&id=${contentId}`);
    if (!response.ok) throw new Error('Error fetching recommendations');
    
    const data = await response.json();
    renderRecommendations(data.results);
  } catch (error) {
    console.error('Error:', error);
    recommendationsList.innerHTML = '<div class="col-12 text-center">Error al cargar recomendaciones.</div>';
  }
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  getIdFromUrl();
  
  if (contentId && contentType) {
    fetchContentDetails();
    
    // Event listeners
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', toggleFavorite);
    }
    
    if (seasonSelector) {
      seasonSelector.addEventListener('change', (e) => {
        currentSeason = parseInt(e.target.value);
        loadEpisodes(currentSeason);
      });
    }
    
    if (videoPlayer && contentType === 'movie') {
      videoPlayer.addEventListener('click', simulatePlayMovie);
    }
  }
});
