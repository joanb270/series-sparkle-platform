
import { fetchAPI } from './api.js';
import { getImageUrl, formatDate } from './api.js';

// Configurar funcionalidad de búsqueda
export const setupSearch = () => {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  
  if (!searchInput || !searchResults) return;
  
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
