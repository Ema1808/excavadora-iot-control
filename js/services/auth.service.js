// Solo desarrollo local: la clave nunca se persiste.
let apiKey = null;
export function setLocalApiKey(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Introduce una clave de pruebas.');
  apiKey = value.trim();
}
export function getLocalApiKey() { return apiKey; }
export function clearLocalApiKey() { apiKey = null; }
