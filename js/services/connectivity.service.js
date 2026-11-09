import { API_CONFIG } from '../config/api.config.js';
import { requestJson } from './http.client.js';

// GET / existe en OpenAPI, pero no es una prueba de RDS ni de las 21 operaciones.
export async function checkApi() {
  await requestJson(API_CONFIG.paths.home);
  return true;
}
