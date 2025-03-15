
// Módulo para gestionar comentarios
import { fetchAPI } from './api.js';

// Estado para almacenar el JWT y el usuario actual
let currentToken = localStorage.getItem('authToken');
let currentUser = null;

// Comprobar si hay un usuario autenticado
const checkAuthentication = () => {
  currentToken = localStorage.getItem('authToken');
  
  // Si hay token, intentar decodificar el payload para obtener info del usuario
  if (currentToken) {
    try {
      // Obtener el payload del JWT (segunda parte)
      const payload = currentToken.split('.')[1];
      // Decodificar el payload de base64
      const decodedPayload = atob(payload);
      // Parsear el JSON
      currentUser = JSON.parse(decodedPayload);
      return true;
    } catch (e) {
      console.error('Error al decodificar el token:', e);
      // Si hay error, limpiar el token
      localStorage.removeItem('authToken');
      currentToken = null;
      currentUser = null;
    }
  }
  
  return false;
};

// Cargar comentarios para un contenido específico
export const loadComments = async (contentId, contentType) => {
  const commentsLoading = document.getElementById('commentsLoading');
  const commentsContent = document.getElementById('commentsContent');
  const noComments = document.getElementById('noComments');
  
  if (!commentsLoading || !commentsContent || !noComments) return;
  
  // Mostrar indicador de carga
  commentsLoading.classList.remove('d-none');
  commentsContent.classList.add('d-none');
  noComments.classList.add('d-none');
  
  try {
    // Obtener comentarios desde la API
    const data = await fetchAPI('/comments', { 
      id: contentId, 
      type: contentType 
    });
    
    // Ocultar indicador de carga
    commentsLoading.classList.add('d-none');
    
    // Si no hay comentarios, mostrar mensaje
    if (!data.comments || data.comments.length === 0) {
      noComments.classList.remove('d-none');
      return;
    }
    
    // Mostrar contenedor de comentarios
    commentsContent.classList.remove('d-none');
    
    // Limpiar contenedor
    commentsContent.innerHTML = '';
    
    // Renderizar cada comentario
    data.comments.forEach(comment => {
      const commentElement = createCommentElement(comment);
      commentsContent.appendChild(commentElement);
    });
  } catch (error) {
    console.error('Error al cargar comentarios:', error);
    commentsLoading.classList.add('d-none');
    
    // Mostrar mensaje de error
    noComments.textContent = 'Error al cargar los comentarios. Intenta de nuevo más tarde.';
    noComments.classList.remove('d-none');
  }
};

// Crear elemento HTML para un comentario
const createCommentElement = (comment) => {
  const commentDiv = document.createElement('div');
  commentDiv.className = 'comment mb-3 pb-3 border-bottom border-secondary';
  
  // Calcular tiempo relativo
  const commentDate = new Date(comment.created_at);
  const timeAgo = getTimeAgo(commentDate);
  
  commentDiv.innerHTML = `
    <div class="d-flex align-items-center mb-2">
      <span class="user-avatar bg-danger text-white rounded-circle d-flex justify-content-center align-items-center me-2"
        style="width: 32px; height: 32px; font-size: 14px;">
        ${comment.username.substring(0, 1).toUpperCase()}
      </span>
      <div>
        <div class="fw-bold">${comment.username}</div>
        <small class="text-muted">${timeAgo}</small>
      </div>
    </div>
    <div class="comment-text">${comment.text}</div>
  `;
  
  return commentDiv;
};

// Calcular tiempo relativo (ej: "hace 5 minutos")
const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `hace ${interval} años`;
  if (interval === 1) return `hace 1 año`;
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `hace ${interval} meses`;
  if (interval === 1) return `hace 1 mes`;
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `hace ${interval} días`;
  if (interval === 1) return `hace 1 día`;
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `hace ${interval} horas`;
  if (interval === 1) return `hace 1 hora`;
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `hace ${interval} minutos`;
  if (interval === 1) return `hace 1 minuto`;
  
  return `hace ${Math.floor(seconds)} segundos`;
};

// Enviar un nuevo comentario
export const submitComment = async (contentId, contentType, text) => {
  // Verificar autenticación
  if (!checkAuthentication()) {
    // Mostrar alerta
    const commentAuthAlert = document.getElementById('commentAuthAlert');
    if (commentAuthAlert) {
      commentAuthAlert.classList.remove('d-none');
      setTimeout(() => {
        commentAuthAlert.classList.add('d-none');
      }, 3000);
    }
    return false;
  }
  
  try {
    // Preparar datos para la solicitud
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({
        content_id: contentId,
        type: contentType,
        text: text
      })
    };
    
    // Realizar solicitud a la API
    const response = await fetch('/api/comments', requestOptions);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    // Recargar comentarios
    await loadComments(contentId, contentType);
    return true;
  } catch (error) {
    console.error('Error al enviar comentario:', error);
    return false;
  }
};

// Inicializar funcionalidad de comentarios
export const initComments = (contentId, contentType) => {
  const commentForm = document.getElementById('commentForm');
  const commentText = document.getElementById('commentText');
  const commentAuthAlert = document.getElementById('commentAuthAlert');
  
  if (!commentForm || !commentText) return;
  
  // Comprobar autenticación al inicio
  if (!checkAuthentication() && commentAuthAlert) {
    commentAuthAlert.classList.remove('d-none');
  }
  
  // Manejar envío del formulario
  commentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    if (!commentText.value.trim()) return;
    
    const success = await submitComment(contentId, contentType, commentText.value.trim());
    
    if (success) {
      // Limpiar formulario
      commentText.value = '';
    }
  });
  
  // Cargar comentarios iniciales
  loadComments(contentId, contentType);
};
