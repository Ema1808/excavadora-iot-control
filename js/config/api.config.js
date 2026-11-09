export const API_CONFIG = Object.freeze({
  baseUrl: 'https://excavadora-em-iot.duckdns.org',
  vehicleId: 7,
  timeoutMs: 10000,
  checkIntervalMs: 30000,
  paths: Object.freeze({
    home: '/',
    commands: '/api/vehiculos/{id_vehiculo}/comandos',
    demos: '/api/vehiculos/{id_vehiculo}/demos',
    state: '/api/vehiculos/{id_vehiculo}/estado',
    movement: '/api/vehiculos/{id_vehiculo}/movimientos',
    startDemo: '/api/vehiculos/{id_vehiculo}/demo/iniciar',
    cancelDemo: '/api/vehiculos/{id_vehiculo}/demo/cancelar'
  }),
  wsUrl: null,
  dbReadyUrl: null
});
export function vehiclePath(path) {
  return path.replaceAll('{id_vehiculo}', String(API_CONFIG.vehicleId));
}
