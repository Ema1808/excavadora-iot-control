
import { API_CONFIG } from './config/api.config.js';

import { loadCommands } from './services/command.service.js';
import { MovementService } from './services/movement.service.js';
import { MovementCoordinator } from './services/movement-coordinator.js';
import {
  loadDemos,
  loadDemoMovements
} from './services/demo.service.js';
import { loadVehicleState } from './services/vehicle-state.service.js';
import { checkApi } from './services/connectivity.service.js';
import { initWebSocket } from './services/websocket.service.js';

import {
  setLocalApiKey,
  clearLocalApiKey,
  getLocalApiKey
} from './services/auth.service.js';

import { setMessage, setStatus } from './ui/status.js';
import { initActivity } from './ui/activity.js';

import { initJoystick } from './controllers/joystick.controller.js';
import { initButtons } from './controllers/buttons.controller.js';
import { initDemoController } from './controllers/demo.controller.js';

// ==========================================
// 1. ELEMENTOS HTML
// ==========================================

const form = document.getElementById('auth-form');
const keyInput = document.getElementById('api-key');
const connectButton = document.getElementById('connect-btn');
const disconnectButton = document.getElementById('disconnect-btn');
const stopButton = document.getElementById('stop-btn');

// ==========================================
// 2. ESTADO DE SESIÓN
// ==========================================

let generation = 0;
let busy = false;

// Servicio preparado con los comandos reales.
// Los movimientos REST permanecen deshabilitados.
let movementService = null;
const restEnabled = false;

// ==========================================
// 3. FUNCIONES AUXILIARES
// ==========================================

function setText(id, value) {
  const element = document.getElementById(id);

  if (!element) {
    console.warn(`[HTML] No se encontró: #${id}`);
    return;
  }

  element.textContent = String(value);
}

function getErrorMessage(error) {
  return error?.message || 'Error desconocido';
}

// ==========================================
// 4. HISTORIAL Y COORDINADOR
// ==========================================

const activity = initActivity();

const movementCoordinator = new MovementCoordinator({
  onActivity(command, source) {
    activity.add(command, source);
  },

  onMessage(message) {
    setMessage(message);
  }
});

// ==========================================
// 5. CONTROLADORES
// ==========================================

const joystickController = initJoystick(
  (command, source) => {
    movementCoordinator.handleJoystick(command, source);
  }
);

const buttonsController = initButtons(
  (command, source) => {
    movementCoordinator.handleButton(command, source);
  }
);

const demoController = initDemoController({
  loadMovements: loadDemoMovements
});

// ==========================================
// 6. WEBSOCKET
// ==========================================

const websocketController = initWebSocket({
  onStatus(state, message) {
    setStatus('wss-status', state, message);
  },

  onMessage(data) {
    console.log('[WebSocket] Evento recibido:', data);

    // No ejecutar movimientos físicos
    // a partir de eventos recibidos.
  },

  onError(error) {
    console.error(
      '[WebSocket]',
      getErrorMessage(error)
    );
  }
});

// ==========================================
// 7. ACTIVAR SIMULACIÓN LOCAL
// ==========================================

joystickController.enable();
buttonsController.enable();
demoController.clear();

// ==========================================
// 8. BOTÓN DETENER
// ==========================================


 // ==========================================
 // 8. BOTÓN DETENER - PRUEBA REST CONTROLADA
 // ==========================================

if (!stopButton) {
  throw new Error('No se encontró el botón DETENER.');
}

stopButton.disabled = false;

// Por seguridad, el único POST permitido en esta prueba
// es DETENER. Los demás controles siguen simulados.
const allowStopRestTest = true;

let stopTestPending = false;

stopButton.addEventListener('click', async () => {
  // Reiniciar visualmente el joystick.
  joystickController.reset();

  // Registrar DETENER en simulación.
  movementCoordinator.stop('Botón STOP');

  // Impedir solicitudes repetidas.
  if (stopTestPending) {
    console.log('[REST] DETENER ya está pendiente.');
    return;
  }

  // Mantener la simulación cuando no exista
  // una sesión local válida.
  if (
    !allowStopRestTest ||
    !getLocalApiKey() ||
    !movementService ||
    !['localhost', '127.0.0.1'].includes(location.hostname)
  ) {
    console.log(
      '[REST] DETENER no enviado. ' +
      'Sin servicio preparado o sin sesión.'
    );
    return;
  }

  const confirmed = window.confirm(
    '¿Deseas enviar DETENER al servidor AWS?\n\n' +
    'Esta acción registrará un movimiento real ' +
    'para el vehículo 7.'
  );

  if (!confirmed) {
    return;
  }

  const current = generation;
  const service = movementService;

  stopTestPending = true;
  stopButton.disabled = true;

  setMessage(
    'Enviando DETENER a FastAPI. ' +
    'Esperando confirmación HTTP...'
  );

  try {
    const response = await service.stop();

    // Ignorar resultados de una sesión anterior.
    if (current !== generation) {
      return;
    }

    console.log('[REST] DETENER aceptado:', response);

    setMessage(
      'FastAPI confirmó el registro de DETENER. ' +
      'Esto no garantiza la ejecución física.'
    );

    // Consultar el estado después del POST.
    const state = await loadVehicleState();

    if (current !== generation) {
      return;
    }

    showVehicleState(state);

    console.log(
      '[REST] Estado consultado después de DETENER:',
      state
    );

  } catch (error) {
    if (current !== generation) {
      return;
    }

    console.error(
      '[REST] Error al enviar DETENER:',
      error
    );

    setMessage(
      'No se pudo confirmar DETENER: ' +
      getErrorMessage(error) +
      '. Verifica el estado antes de repetir la solicitud.'
    );

  } finally {
    stopTestPending = false;
    stopButton.disabled = false;
  }
});


// ==========================================
// 9. CATÁLOGO DE COMANDOS
// ==========================================

function showCatalog(commands) {
  const existing = document.getElementById('catalog-summary');

  const summary = existing || document.createElement('p');

  summary.id = 'catalog-summary';
  summary.className = 'muted small mt-3 mb-0';

  summary.textContent =
    `Comandos activos validados (${commands.size}): ` +
    `${[...commands.keys()].join(', ') || 'ninguno'}.`;

  if (!existing) {
    document.getElementById('action-message')?.after(summary);
  }
}

function clearCatalog() {
  document.getElementById('catalog-summary')?.remove();
}

// ==========================================
// 10. ESTADO REGISTRADO DEL VEHÍCULO
// ==========================================

function clearVehicleState() {
  setText('vehicle-name', 'Sin consultar');
  setText('vehicle-command', 'Sin consultar');
  setText('vehicle-connected', 'Sin verificar');
  setText('vehicle-updated', 'Sin consultar');
}

function showVehicleState(state) {
  setText(
    'vehicle-name',
    `${state.vehicleName} #${state.vehicleId}`
  );

  setText(
    'vehicle-command',
    `${state.command} (código ${state.code})`
  );

  setText(
    'vehicle-connected',
    state.connected
      ? 'Conectado = 1 (según backend)'
      : 'Conectado = 0 (según backend)'
  );

  setText(
    'vehicle-updated',
    state.updatedAt
  );
}

// ==========================================
// 11. LIMPIAR SERVICIO DE MOVIMIENTOS
// ==========================================

function clearMovementService() {
  movementService = null;
  movementCoordinator.reset();
}

// ==========================================
// 12. DESCONECTAR SESIÓN
// ==========================================

function resetSession(message) {
  generation++;

  clearMovementService();
  clearLocalApiKey();

  if (keyInput) {
    keyInput.value = '';
  }

  demoController.clear();
  clearCatalog();
  clearVehicleState();

  setStatus(
    'api-status',
    'checking',
    'Sin autenticar'
  );

  setText('auth-message', message);

  setMessage(
    'Sesión desconectada. ' +
    'Joystick y botones disponibles ' +
    'únicamente en simulación local.'
  );
}

// ==========================================
// 13. VALIDAR CATÁLOGO REST
// ==========================================

function isValidCommandCatalog(commands) {
  if (!(commands instanceof Map)) {
    return false;
  }

  const required = [
    'AVANZAR',
    'RETROCEDER',
    'GIRAR_IZQUIERDA',
    'GIRAR_DERECHA',
    'SUBIR_BRAZO',
    'BAJAR_BRAZO',
    'ABRIR_PALA',
    'CERRAR_PALA',
    'DETENER'
  ];

  return required.every((name) => {
    const command = commands.get(name);

    return (
      command &&
      Number.isSafeInteger(command.id) &&
      Number.isSafeInteger(command.code)
    );
  });
}

// ==========================================
// 14. PREPARAR SERVICIO REST
// ==========================================

function prepareMovementService(commands) {
  if (!isValidCommandCatalog(commands)) {
    clearMovementService();

    console.warn(
      '[REST] Catálogo incompleto o formato inesperado.'
    );

    return;
  }

  // No reemplazar el servicio si tiene
  // solicitudes pendientes.
  if (
  movementService &&
  (
    movementService.processing ||
    movementService.queue.length > 0
  )
) {
  return;
}

  movementService = new MovementService(commands);

  movementCoordinator.setMovementService(
    movementService
  );

  console.log(
    '[REST] Catálogo preparado. Envío habilitado:',
    restEnabled
  );
}

// ==========================================
// 15. CONSULTAR FASTAPI
// ==========================================

async function refresh() {
  if (
    busy ||
    document.hidden ||
    !getLocalApiKey()
  ) {
    return;
  }

  const current = generation;
  busy = true;

  setStatus(
    'api-status',
    'checking',
    'Comprobando'
  );

  try {
    // Verificar disponibilidad de FastAPI.
    await checkApi();

    if (current !== generation) {
      return;
    }

    // Consultar comandos, demostraciones
    // y estado registrado del vehículo.
    const [
      commands,
      demos,
      vehicleState
    ] = await Promise.allSettled([
      loadCommands(),
      loadDemos(),
      loadVehicleState()
    ]);

    if (current !== generation) {
      return;
    }

    // --------------------------------------
    // COMANDOS
    // --------------------------------------

    if (commands.status === 'fulfilled') {
      showCatalog(commands.value);

      prepareMovementService(commands.value);
    } else {
      clearCatalog();
      clearMovementService();

      console.warn(
        '[Comandos]',
        getErrorMessage(commands.reason)
      );
    }

    // --------------------------------------
    // DEMOSTRACIONES
    // --------------------------------------

    if (demos.status === 'fulfilled') {
      demoController.setDemos(demos.value);
    } else {
      demoController.clear();

      console.warn(
        '[DEMO]',
        getErrorMessage(demos.reason)
      );
    }

    // --------------------------------------
    // ESTADO DE LA EXCAVADORA
    // --------------------------------------

    if (vehicleState.status === 'fulfilled') {
      showVehicleState(vehicleState.value);

      console.log(
        '[Estado de excavadora]',
        vehicleState.value
      );
    } else {
      clearVehicleState();

      console.warn(
        '[Estado de excavadora]',
        getErrorMessage(vehicleState.reason)
      );
    }

    // --------------------------------------
    // RESUMEN DE CONSULTAS
    // --------------------------------------

    const c = commands.status === 'fulfilled'
      ? `${commands.value.size} comandos validados`
      : `Comandos: ${getErrorMessage(commands.reason)}`;

    const d = demos.status === 'fulfilled'
      ? `${demos.value.length} DEMO activas validadas`
      : `DEMO: ${getErrorMessage(demos.reason)}`;

    const e = vehicleState.status === 'fulfilled'
      ? `Último comando registrado: ${vehicleState.value.command}`
      : `Estado: ${getErrorMessage(vehicleState.reason)}`;

    const authorized =
      commands.status === 'fulfilled';

    setStatus(
      'api-status',
      authorized ? 'online' : 'offline',
      authorized
        ? 'Disponible (GET comandos)'
        : 'Consulta fallida'
    );

    setMessage(
      `${c}. ${d}. ${e}. ` +
      'Movimientos reales deshabilitados; ' +
      'joystick y botones en simulación.'
    );

    setText(
      'auth-message',
      authorized
        ? 'Consulta autenticada correctamente.'
        : 'No se pudo validar la consulta autenticada.'
    );

  } catch (error) {
    if (current !== generation) {
      return;
    }

    clearMovementService();

    demoController.clear();
    clearCatalog();
    clearVehicleState();

    setStatus(
      'api-status',
      'offline',
      error?.status === 401 || error?.status === 403
        ? 'Autenticación rechazada'
        : 'Error de conexión'
    );

    const message = getErrorMessage(error);

    setMessage(message);
    setText('auth-message', message);

    console.error('[FastAPI]', error);

  } finally {
    busy = false;

    if (connectButton) {
      connectButton.disabled = false;
    }
  }
}

// ==========================================
// 16. CONECTAR CON FASTAPI
// ==========================================

if (!form || !keyInput || !connectButton) {
  throw new Error(
    'Faltan elementos HTML del formulario de autenticación.'
  );
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (busy) {
    return;
  }

  // Autenticación de pruebas solo
  // desde Live Server local.
  if (
    !['localhost', '127.0.0.1'].includes(
      location.hostname
    )
  ) {
    setText(
      'auth-message',
      'Esta autenticación de pruebas ' +
      'solo está permitida en localhost.'
    );

    return;
  }

  try {
    setLocalApiKey(keyInput.value);
  } catch (error) {
    setText(
      'auth-message',
      getErrorMessage(error)
    );

    return;
  }

  generation++;

  clearMovementService();

  keyInput.value = '';

  demoController.clear();
  clearCatalog();
  clearVehicleState();

  connectButton.disabled = true;

  setText(
    'auth-message',
    'Validando clave mediante consulta autenticada…'
  );

  await refresh();
});

// ==========================================
// 17. DESCONECTAR
// ==========================================

if (!disconnectButton) {
  throw new Error(
    'No se encontró el botón Desconectar.'
  );
}

disconnectButton.addEventListener('click', () => {
  resetSession('Sesión local desconectada.');
});

// ==========================================
// 18. ESTADOS INICIALES
// ==========================================

setStatus(
  'wss-status',
  'offline',
  'Desconectado (sin autenticación WSS)'
);

setStatus(
  'rds-status',
  'unknown',
  'Sin verificar'
);

setStatus(
  'api-status',
  'checking',
  'Sin autenticar'
);

clearVehicleState();

setMessage(
  'Joystick y botones en simulación local. ' +
  'Conecta la clave de pruebas para consultar FastAPI. ' +
  'Movimientos reales deshabilitados.'
);

// ==========================================
// 19. ACTUALIZACIÓN PERIÓDICA
// ==========================================

const interval = setInterval(
  refresh,
  API_CONFIG.checkIntervalMs
);

// ==========================================
// 20. SALIR DE LA PÁGINA
// ==========================================

window.addEventListener(
  'pagehide',
  () => {
    websocketController.disconnect();

    clearInterval(interval);
    clearLocalApiKey();

    clearMovementService();

    demoController.clear();
    clearVehicleState();

    joystickController.disable();
    buttonsController.disable();
  },
  { once: true }
);

// ==========================================
// 21. REGRESAR A LA PESTAÑA
// ==========================================

document.addEventListener(
  'visibilitychange',
  () => {
    if (!document.hidden) {
      refresh();
    }
  }
);
