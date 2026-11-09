import { getLocalApiKey } from './auth.service.js';
import { API_CONFIG } from '../config/api.config.js';

export class ApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function requestJson(path, { method = 'GET', body, signal, timeoutMs = API_CONFIG.timeoutMs } = {}) {
  if (!path.startsWith('/') || path.startsWith('//')) throw new ApiError('Ruta no permitida');
  const controller = new AbortController();
  const apiKey = getLocalApiKey();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener('abort', abort, { once: true });
  try {
    const response = await fetch(new URL(path, API_CONFIG.baseUrl), {
      method,
      headers: { Accept: 'application/json', ...(apiKey ? { 'x-api-key': apiKey } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: controller.signal,
      cache: 'no-store'
    });
    if (!response.ok) {
      const message = response.status === 401 || response.status === 403
        ? 'Autenticación rechazada (HTTP ' + response.status + '). Revisa la clave de pruebas.'
        : `La API respondió con HTTP ${response.status}.`;
      throw new ApiError(message, response.status);
    }
    const raw = await response.text();
    if (!raw.trim()) return null;
    try { return JSON.parse(raw); }
    catch { throw new ApiError('La API devolvió JSON no válido.', response.status); }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'AbortError') throw new ApiError('La solicitud expiró o fue cancelada.');
    throw new ApiError('No se pudo conectar con la API. Revisa HTTPS, CORS y la red.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
