
import { API_CONFIG, vehiclePath } from '../config/api.config.js';
import { requestJson } from './http.client.js';

export async function loadDemos() {
  const response = await requestJson(
    vehiclePath(API_CONFIG.paths.demos)
  );

  if (!Array.isArray(response)) {
    throw new Error('La respuesta de DEMO no es una lista.');
  }

  const demos = [];
  const ids = new Set();

  for (const item of response) {
    if (
      !item ||
      !Number.isSafeInteger(item.id_demo) ||
      item.id_demo <= 0 ||
      item.id_vehiculo !== API_CONFIG.vehicleId ||
      typeof item.nombre !== 'string' ||
      !item.nombre.trim() ||
      item.activo !== 1
    ) {
      continue;
    }

    if (ids.has(item.id_demo)) {
      throw new Error('Se encontraron DEMO duplicadas.');
    }

    ids.add(item.id_demo);

    demos.push(Object.freeze({
      id: item.id_demo,
      name: item.nombre,
      description:
        typeof item.descripcion === 'string'
          ? item.descripcion
          : ''
    }));
  }

  return demos;
}

// Iniciar una DEMO mediante FastAPI.
// Solo debe invocarse tras autorización explícita.
export async function startDemo(idDemo) {
  if (!Number.isSafeInteger(idDemo) || idDemo <= 0) {
    throw new Error('ID de DEMO inválido.');
  }

  return requestJson(
    vehiclePath(API_CONFIG.paths.startDemo),
    {
      method: 'POST',
      body: {
        id_demo: idDemo
      }
    }
  );
}

// Cancelar la DEMO mediante FastAPI.
// Swagger muestra esta operación sin cuerpo JSON.
export async function cancelDemo() {
  return requestJson(
    vehiclePath(API_CONFIG.paths.cancelDemo),
    {
      method: 'POST'
    }
  );
}
