
import { API_CONFIG } from '../config/api.config.js';

export function initWebSocket({
  onStatus = () => {},
  onMessage = () => {},
  onError = () => {}
} = {}) {
  let socket = null;

  function connect() {
    if (!API_CONFIG.wsUrl) {
      onStatus('offline', 'Pendiente de autenticación WSS');
      return false;
    }

    // No colocar claves permanentes en la URL.
    const url = new URL(API_CONFIG.wsUrl);

    if (url.protocol !== 'wss:') {
      onError(new Error('Se requiere WebSocket seguro (WSS).'));
      return false;
    }

    if (url.searchParams.has('api_key')) {
      onError(new Error('No se permiten claves permanentes en la URL.'));
      return false;
    }

    if (socket) {
      return false;
    }

    onStatus('checking', 'Conectando WSS');

    try {
      socket = new WebSocket(url.href);

      socket.addEventListener('open', () => {
        onStatus('online', 'WSS conectado');
      });

      socket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch {
          onError(new Error('Mensaje WSS no válido.'));
        }
      });

      socket.addEventListener('error', () => {
        onError(new Error('Error de conexión WebSocket.'));
      });

      socket.addEventListener('close', () => {
        socket = null;
        onStatus('offline', 'WSS desconectado');
      });

      return true;
    } catch (error) {
      socket = null;
      onStatus('offline', 'WSS no disponible');
      onError(error);
      return false;
    }
  }

  function disconnect() {
    if (socket) {
      socket.close(1000, 'Desconexión local');
      socket = null;
    }

    onStatus('offline', 'WSS desconectado');
  }

  return {
    connect,
    disconnect
  };
}
