
// Configuración y utilidades de API
const API_BASE_URL = '/api';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';
const DEFAULT_IMG = '/placeholder.svg';

// Función para formatear fechas
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).getFullYear();
};

// Función para obtener URLs de imágenes
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return DEFAULT_IMG;
  return `${IMG_BASE_URL}/${size}${path}`;
};

// Función para realizar peticiones a la API con soporte offline
export const fetchAPI = async (endpoint, params = {}) => {
  try {
    // Construir URL con parámetros
    const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    if (!window.isOnline) {
      console.log(`Modo offline: Intentando recuperar ${endpoint} desde caché`);
      
      // Intentar recuperar de la caché cuando estamos offline
      const cache = await caches.open('seriessparkle-v1');
      
      // Para trending y búsqueda usamos la URL base sin parámetros
      // ya que guardamos una sola versión en caché
      const cacheKey = endpoint === '/trending' || endpoint === '/search/multi' 
        ? new URL(`${API_BASE_URL}${endpoint}`, window.location.origin)
        : url;
      
      const cachedResponse = await cache.match(cacheKey);
      
      if (cachedResponse) {
        return await cachedResponse.json();
      } else {
        console.warn(`No se encontraron datos en caché para: ${endpoint}`);
        return { results: [] };
      }
    }
    
    // Si estamos online, hacemos la petición normal
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    
    // Si hay un error de red, intentamos recuperar de la caché como último recurso
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      try {
        console.log(`Error de red: Intentando recuperar ${endpoint} desde caché`);
        const cache = await caches.open('seriessparkle-v1');
        const cacheUrl = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);
        const cachedResponse = await cache.match(cacheUrl);
        
        if (cachedResponse) {
          return await cachedResponse.json();
        }
      } catch (cacheError) {
        console.error('Error recuperando de caché:', cacheError);
      }
    }
    
    return { results: [] };
  }
};
