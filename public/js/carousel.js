
import { getImageUrl } from './api.js';

// Renderizar el carrusel de trending
export const renderTrendingCarousel = (items) => {
  const trendingCarousel = document.getElementById('trendingCarousel');
  if (!trendingCarousel) return;
  
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

// Renderizar tarjeta de contenido
export const renderContentCard = (item) => {
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

// Helper importado de api.js pero necesario localmente
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).getFullYear();
};

// Helper importado de api.js pero necesario localmente
const getImageUrl = (path, size = 'w500') => {
  if (!path) return '/placeholder.svg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
