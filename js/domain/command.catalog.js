export const COMMAND_NAMES = Object.freeze([
  'AVANZAR', 'RETROCEDER', 'GIRAR_IZQUIERDA', 'GIRAR_DERECHA',
  'SUBIR_BRAZO', 'BAJAR_BRAZO', 'ABRIR_PALA', 'CERRAR_PALA', 'DETENER'
]);
const allowed = new Set(COMMAND_NAMES);
export function validateCommands(data, vehicleId) {
  if (!Array.isArray(data)) throw new Error('La respuesta de comandos no es una lista.');
  const commands = new Map();
  for (const item of data) {
    if (!item || !Number.isSafeInteger(item.id_comando) || item.id_comando <= 0 ||
        item.id_vehiculo !== vehicleId || !Number.isSafeInteger(item.codigo) ||
        !allowed.has(item.nombre) || item.activo !== 1) continue;
    if (commands.has(item.nombre)) throw new Error('Hay comandos activos duplicados.');
    commands.set(item.nombre, Object.freeze({
      id: item.id_comando, code: item.codigo, name: item.nombre
    }));
  }
  return commands;
}
