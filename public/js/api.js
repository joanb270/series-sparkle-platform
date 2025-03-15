
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

// Función para realizar peticiones a la API
export const fetchAPI = async (endpoint, params = {}) => {
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
