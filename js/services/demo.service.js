
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
// Consultar los movimientos de una DEMO.
// Solo lectura: no inicia movimientos físicos.
export async function loadDemoMovements(idDemo, signal) {
  if (!Number.isSafeInteger(idDemo) || idDemo <= 0) {
    throw new Error('ID de DEMO inválido.');
  }

  const response = await requestJson(
    `/api/demos/${idDemo}/movimientos`,
    { signal }
  );

  const movements = Array.isArray(response)
    ? response
    : response?.value;

  if (!Array.isArray(movements)) {
    throw new Error('La secuencia DEMO no es válida.');
  }

  const orders = new Set();

  const result = movements.map(item => {
    if (
      !item ||
      !Number.isSafeInteger(item.orden) ||
      item.orden <= 0 ||
      !Number.isSafeInteger(item.id_comando) ||
      item.id_comando <= 0 ||
      typeof item.comando !== 'string' ||
      !item.comando.trim() ||
      !Number.isSafeInteger(item.duracion_ms) ||
      item.duracion_ms < 0 ||
      !Number.isSafeInteger(item.pausa_ms) ||
      item.pausa_ms < 0
    ) {
      throw new Error('Movimiento DEMO inválido.');
    }

    if (orders.has(item.orden)) {
      throw new Error('La DEMO contiene órdenes duplicados.');
    }

    orders.add(item.orden);

    return Object.freeze({
      order: item.orden,
      commandId: item.id_comando,
      command: item.comando,
      durationMs: item.duracion_ms,
      pauseMs: item.pausa_ms
    });
  });

  return result.sort((a, b) => a.order - b.order);
}