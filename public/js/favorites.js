
import { getImageUrl } from './api.js';

// Funciones para gestionar favoritos
export const getFavorites = () => {
  const favorites = localStorage.getItem('favorites');
  return favorites ? JSON.parse(favorites) : [];
};

export const addToFavorites = (content) => {
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

export const removeFromFavorites = (id, type) => {
  const favorites = getFavorites();
  const updatedFavorites = favorites.filter(
    item => !(item.id === id && item.media_type === type)
  );
  localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  
  renderFavorites();
  updateFavoriteButtons();
};

export const isInFavorites = (id, type) => {
  const favorites = getFavorites();
  return favorites.some(item => item.id === id && item.media_type === type);
};

export const updateFavoriteButtons = () => {
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

export const renderFavorites = () => {
  const favoritesList = document.getElementById('favoritesList');
  const favoritesSection = document.getElementById('favoritesSection');
  if (!favoritesList || !favoritesSection) return;
  
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
        const content = window.allContent.find(item => item.id === id && item.media_type === type);
        if (content) {
          addToFavorites(content);
        }
      }
    });
  });
};

// Helper importado de api.js pero necesario localmente
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).getFullYear();
};
