import { API_CONFIG, vehiclePath } from '../config/api.config.js';
import { requestJson } from './http.client.js';
import { validateCommands } from '../domain/command.catalog.js';

export async function loadCommands() {
  const response = await requestJson(vehiclePath(API_CONFIG.paths.commands));
  return validateCommands(response, API_CONFIG.vehicleId);
}
