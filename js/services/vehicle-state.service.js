
import {
  API_CONFIG,
  vehiclePath
} from '../config/api.config.js';

import { requestJson } from './http.client.js';

export async function loadVehicleState() {
  const response = await requestJson(
    vehiclePath(API_CONFIG.paths.state)
  );

  if (!Array.isArray(response)) {
    throw new Error('La respuesta de estado no es una lista.');
  }

  const state = response.find(
    item => item?.id_vehiculo === API_CONFIG.vehicleId
  );

  if (!state) {
    throw new Error('No se encontró el estado de la excavadora.');
  }

  if (
    !Number.isSafeInteger(state.id_comando) ||
    typeof state.comando !== 'string' ||
    !Number.isSafeInteger(state.codigo) ||
    ![0, 1].includes(state.conectado) ||
    typeof state.fecha_actualizacion !== 'string'
  ) {
    throw new Error('El estado recibido no tiene el formato esperado.');
  }

  return Object.freeze({
    vehicleId: state.id_vehiculo,
    vehicleName: state.vehiculo,
    commandId: state.id_comando,
    command: state.comando,
    code: state.codigo,
    connected: state.conectado === 1,
    updatedAt: state.fecha_actualizacion
  });
}
