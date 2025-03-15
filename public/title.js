
// Importar módulos
import { fetchAPI, getImageUrl, formatDate } from './js/api.js';
import { isFavorite, addToFavorites, removeFromFavorites } from './js/favorites.js';
import { initComments } from './js/comments.js';

// Variables globales
let contentId = null;
let contentType = null;

// Función principal para inicializar la página de detalle
const initTitlePage = async () => {
  // Obtener parámetros de la URL
  const urlParams = new URLSearchParams(window.location.search);
  contentId = urlParams.get('id');
  contentType = urlParams.get('type') || 'movie';
  
  if (!contentId) {
    showError('ID de contenido no especificado');
    return;
  }
  
  // Cargar detalles del contenido
  try {
    const contentDetails = await fetchAPI('/details', {
      id: contentId,
      type: contentType
    });
    
    if (contentDetails.error) {
      showError(contentDetails.error);
      return;
    }
    
    // Renderizar detalles
    renderContentDetails(contentDetails);
    
    // Comprobar si es favorito
    updateFavoriteButton(contentId, contentType);
    
    // Cargar videos (trailers, etc.)
    loadVideos(contentId, contentType);
    
    // Cargar recomendaciones
    loadRecommendations(contentId, contentType);
    
    // Si es una serie, cargar temporadas y episodios
    if (contentType === 'tv') {
      loadSeasons(contentId, contentDetails.seasons || []);
    } else {
      // Ocultar sección de episodios para películas
      const episodesSection = document.getElementById('episodesSection');
      if (episodesSection) {
        episodesSection.classList.add('d-none');
      }
    }
    
    // Inicializar comentarios
    initComments(contentId, contentType);
    
  } catch (error) {
    console.error('Error al cargar detalles:', error);
    showError('Error al cargar los detalles. Intenta de nuevo más tarde.');
  }
};

// Función para mostrar un mensaje de error
const showError = (message) => {
  const contentDetails = document.getElementById('contentDetails');
  if (contentDetails) {
    contentDetails.innerHTML = `
      <div class="container mt-5 text-center">
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          ${message}
        </div>
        <a href="/" class="btn btn-outline-light mt-3">
          <i class="bi bi-house-fill me-2"></i>Volver al inicio
        </a>
      </div>
    `;
  }
};

// Renderizar detalles del contenido
const renderContentDetails = (content) => {
  // Actualizar título de la página
  document.title = `${content.title || content.name} - SeriesSparkle`;
  
  // Obtener elementos del DOM
  const titleName = document.getElementById('titleName');
  const contentTitle = document.getElementById('contentTitle');
  const contentType = document.getElementById('contentType');
  const releaseYear = document.getElementById('releaseYear');
  const contentRating = document.getElementById('contentRating');
  const contentDuration = document.getElementById('contentDuration');
  const contentOverview = document.getElementById('contentOverview');
  const genresList = document.getElementById('genresList');
  const contentPoster = document.getElementById('contentPoster');
  const titleBanner = document.getElementById('titleBanner');
  
  // Actualizar elementos con la información del contenido
  if (titleName) titleName.textContent = content.title || content.name;
  if (contentTitle) contentTitle.textContent = content.title || content.name;
  if (contentType) contentType.textContent = content.media_type === 'movie' ? 'Películas' : 'Series';
  
  // Año de lanzamiento
  const year = (content.release_date || content.first_air_date || '').substring(0, 4);
  if (releaseYear && year) releaseYear.textContent = year;
  
  // Puntuación
  if (contentRating && content.vote_average) {
    const rating = Math.round(content.vote_average / 2); // Convertir de 10 a 5 estrellas
    contentRating.innerHTML = generateStarsHTML(rating);
  }
  
  // Duración
  if (contentDuration) {
    if (content.runtime) {
      // Para películas
      const hours = Math.floor(content.runtime / 60);
      const minutes = content.runtime % 60;
      contentDuration.textContent = `${hours}h ${minutes}m`;
    } else if (content.episode_run_time && content.episode_run_time.length > 0) {
      // Para series
      const runtime = content.episode_run_time[0];
      const hours = Math.floor(runtime / 60);
      const minutes = runtime % 60;
      contentDuration.textContent = `${hours}h ${minutes}m por episodio`;
    } else {
      contentDuration.textContent = 'Duración desconocida';
    }
  }
  
  // Sinopsis
  if (contentOverview) {
    contentOverview.textContent = content.overview || 'No hay sinopsis disponible.';
  }
  
  // Géneros
  if (genresList && content.genres) {
    genresList.innerHTML = content.genres.map(genre => 
      `<span class="badge bg-dark border border-light me-2 mb-2">${genre.name}</span>`
    ).join('');
  }
  
  // Poster
  if (contentPoster) {
    contentPoster.src = getImageUrl(content.poster_path);
    contentPoster.alt = content.title || content.name;
  }
  
  // Fondo del banner
  if (titleBanner && content.backdrop_path) {
    titleBanner.style.backgroundImage = `url(${getImageUrl(content.backdrop_path, 'original')})`;
  }
};

// Generar HTML para las estrellas de valoración
const generateStarsHTML = (rating) => {
  let starsHTML = '';
  
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      starsHTML += '<i class="bi bi-star-fill text-warning"></i>';
    } else if (i - 0.5 <= rating) {
      starsHTML += '<i class="bi bi-star-half text-warning"></i>';
    } else {
      starsHTML += '<i class="bi bi-star text-warning"></i>';
    }
  }
  
  return starsHTML;
};

// Actualizar botón de favoritos
const updateFavoriteButton = (id, type) => {
  const favoriteBtn = document.getElementById('favoriteBtn');
  if (!favoriteBtn) return;
  
  const isFav = isFavorite(id, type);
  
  if (isFav) {
    favoriteBtn.innerHTML = '<i class="bi bi-heart-fill"></i>';
    favoriteBtn.classList.add('active');
  } else {
    favoriteBtn.innerHTML = '<i class="bi bi-heart"></i>';
    favoriteBtn.classList.remove('active');
  }
  
  // Manejar clic en botón de favoritos
  favoriteBtn.addEventListener('click', () => {
    if (isFavorite(id, type)) {
      removeFromFavorites(id);
    } else {
      // Obtener datos básicos del contenido para añadir a favoritos
      const title = document.getElementById('titleName')?.textContent || '';
      const poster = document.getElementById('contentPoster')?.src || '';
      
      addToFavorites({
        id,
        type,
        title,
        poster_path: poster.includes('placeholder.svg') ? null : poster,
      });
    }
    
    // Actualizar botón
    updateFavoriteButton(id, type);
  });
};

// Cargar videos (trailers, etc.)
const loadVideos = async (id, type) => {
  try {
    const data = await fetchAPI('/videos', { id, type });
    
    if (!data.results || data.results.length === 0) return;
    
    // Buscar un trailer o teaser
    const trailer = data.results.find(video => 
      video.site === 'YouTube' && ['Trailer', 'Teaser'].includes(video.type)
    );
    
    if (!trailer) return;
    
    // Actualizar el reproductor
    const videoPlayer = document.getElementById('videoPlayer');
    if (videoPlayer) {
      videoPlayer.innerHTML = `
        <iframe 
          src="https://www.youtube.com/embed/${trailer.key}?rel=0" 
          title="YouTube video player" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
        ></iframe>
      `;
    }
  } catch (error) {
    console.error('Error al cargar videos:', error);
  }
};

// Cargar recomendaciones
const loadRecommendations = async (id, type) => {
  try {
    const data = await fetchAPI('/recommendations', { id, type });
    
    const recommendationsList = document.getElementById('recommendationsList');
    if (!recommendationsList) return;
    
    if (!data.results || data.results.length === 0) {
      recommendationsList.innerHTML = '<div class="col-12 text-center text-muted">No hay recomendaciones disponibles</div>';
      return;
    }
    
    // Limitar a 6 recomendaciones
    const recommendations = data.results.slice(0, 6);
    
    // Renderizar recomendaciones
    recommendationsList.innerHTML = recommendations.map(item => `
      <div class="col">
        <div class="card bg-dark h-100 border-0 poster-card">
          <a href="/title?id=${item.id}&type=${item.media_type || type}" class="text-decoration-none">
            <img src="${getImageUrl(item.poster_path)}" class="card-img-top" alt="${item.title || item.name}">
            <div class="card-body p-2">
              <h6 class="card-title text-truncate text-light mb-0">
                ${item.title || item.name}
              </h6>
              <small class="text-muted">${formatDate(item.release_date || item.first_air_date)}</small>
            </div>
          </a>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error al cargar recomendaciones:', error);
  }
};

// Cargar temporadas (para series)
const loadSeasons = async (id, seasons) => {
  const seasonSelector = document.getElementById('seasonSelector');
  const episodesSection = document.getElementById('episodesSection');
  
  if (!seasonSelector || !episodesSection || !seasons.length) return;
  
  // Mostrar sección de episodios
  episodesSection.classList.remove('d-none');
  
  // Filtrar temporadas reales (ignorar temporadas especiales)
  const realSeasons = seasons.filter(season => season.season_number > 0);
  
  if (realSeasons.length === 0) {
    episodesSection.classList.add('d-none');
    return;
  }
  
  // Poblar selector de temporadas
  seasonSelector.innerHTML = realSeasons.map(season => 
    `<option value="${season.season_number}">Temporada ${season.season_number}</option>`
  ).join('');
  
  // Cargar episodios de la primera temporada
  await loadEpisodes(id, realSeasons[0].season_number);
  
  // Manejar cambio de temporada
  seasonSelector.addEventListener('change', () => {
    const selectedSeason = parseInt(seasonSelector.value);
    loadEpisodes(id, selectedSeason);
  });
};

// Cargar episodios de una temporada
const loadEpisodes = async (seriesId, seasonNumber) => {
  const episodesList = document.getElementById('episodesList');
  if (!episodesList) return;
  
  try {
    // Mostrar indicador de carga
    episodesList.innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="spinner-border text-danger" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
    `;
    
    // Cargar datos de la temporada
    const seasonData = await fetchAPI('/episodes', {
      series_id: seriesId,
      season: seasonNumber.toString()
    });
    
    if (!seasonData.episodes || seasonData.episodes.length === 0) {
      episodesList.innerHTML = '<div class="col-12 text-center text-muted">No hay episodios disponibles</div>';
      return;
    }
    
    // Renderizar episodios
    episodesList.innerHTML = seasonData.episodes.map(episode => {
      const episodeImg = episode.still_path 
        ? getImageUrl(episode.still_path) 
        : '/placeholder.svg';
      
      return `
        <div class="col">
          <div class="card h-100 bg-dark border-secondary episode-card">
            <div class="row g-0">
              <div class="col-md-4">
                <img src="${episodeImg}" class="img-fluid rounded-start episode-image" alt="Episodio ${episode.episode_number}">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h6 class="card-title">
                    ${episode.episode_number}. ${episode.name}
                  </h6>
                  <p class="card-text small text-muted mb-2">
                    ${formatDate(episode.air_date)}
                    ${episode.runtime ? ` · ${episode.runtime} min` : ''}
                  </p>
                  <p class="card-text small episode-overview">
                    ${episode.overview || 'No hay descripción disponible.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // Manejar clic en episodios
    const episodeCards = document.querySelectorAll('.episode-card');
    episodeCards.forEach(card => {
      card.addEventListener('click', () => {
        // Aquí podrías implementar la lógica para reproducir el episodio
        alert('Esta funcionalidad no está disponible en esta versión de demostración.');
      });
    });
  } catch (error) {
    console.error('Error al cargar episodios:', error);
    episodesList.innerHTML = '<div class="col-12 text-center text-danger">Error al cargar episodios. Intenta de nuevo más tarde.</div>';
  }
};

// Inicializar la página
document.addEventListener('DOMContentLoaded', initTitlePage);
