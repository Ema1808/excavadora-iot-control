
const VALID_COMMANDS = new Set([
  'AVANZAR',
  'RETROCEDER',
  'GIRAR_IZQUIERDA',
  'GIRAR_DERECHA',
  'SUBIR_BRAZO',
  'BAJAR_BRAZO',
  'ABRIR_PALA',
  'CERRAR_PALA',
  'DETENER'
]);

export class MovementCoordinator {
  constructor({
    onActivity = () => {},
    onMessage = () => {}
  } = {}) {
    this.onActivity = onActivity;
    this.onMessage = onMessage;

    this.mode = 'SIMULATION';
    this.lastDirection = 'NEUTRAL';
    this.movementService = null;
  }

  setMovementService(service) {
    this.movementService = service;
  }

  getMode() {
    return this.mode;
  }

  handleJoystick(command, source = 'Joystick') {
    const normalized =
      command === 'NEUTRAL' ? 'DETENER' : command;

    if (!VALID_COMMANDS.has(normalized)) {
      console.warn('[Coordinador] Comando no permitido:', command);
      return;
    }

    if (command === this.lastDirection) {
      return;
    }

    this.lastDirection = command;

    this.simulate(normalized, source);
  }

  handleButton(command, source = 'Botón') {
    if (!VALID_COMMANDS.has(command)) {
      console.warn('[Coordinador] Comando no permitido:', command);
      return;
    }

    this.simulate(command, source);
  }

  stop(source = 'Botón STOP') {
    this.lastDirection = 'NEUTRAL';
    this.simulate('DETENER', source);
  }

  simulate(command, source) {
    this.onActivity(command, source);

    const message =
      `Simulación local: ${command}. ` +
      'No se envió ningún comando a FastAPI.';

    this.onMessage(message);

    console.log(
      '[Coordinador]',
      {
        mode: this.mode,
        command,
        source,
        sentToApi: false
      }
    );
  }

  reset() {
    this.lastDirection = 'NEUTRAL';
    this.movementService = null;
  }
}
