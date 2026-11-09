
import { API_CONFIG, vehiclePath } from '../config/api.config.js';
import { requestJson } from './http.client.js';

export class MovementService {
  constructor(commands) {
    if (!(commands instanceof Map)) {
      throw new Error('Catálogo de comandos inválido.');
    }

    this.commands = new Map(commands);

    this.queue = [];
    this.processing = false;
    this.stopRequested = false;
    this.activeCommand = null;
    this.stopPromise = null;
  }

  getCommand(name) {
    const command = this.commands.get(name);

    if (
      !command ||
      !Number.isSafeInteger(command.id) ||
      !Number.isSafeInteger(command.code)
    ) {
      throw new Error(`Comando no disponible: ${name}`);
    }

    return command;
  }

  send(name) {
    if (name === 'DETENER') {
      return this.stop();
    }

    this.getCommand(name);

    if (this.stopRequested) {
      return Promise.reject(
        new Error('DETENER tiene prioridad.')
      );
    }

    return new Promise((resolve, reject) => {
      // Conservar solamente el movimiento
      // más reciente que todavía no se envía.
      const discarded = this.queue.splice(0);

      discarded.forEach((item) => {
        item.reject(
          new Error('Movimiento sustituido por uno más reciente.')
        );
      });

      this.queue.push({
        name,
        resolve,
        reject
      });

      this.processQueue();
    });
  }

  stop() {
    if (this.stopPromise) {
      return this.stopPromise;
    }

    this.stopRequested = true;

    // Descartar movimientos que todavía
    // no han sido enviados.
    const discarded = this.queue.splice(0);

    discarded.forEach((item) => {
      item.reject(
        new Error('Movimiento cancelado por DETENER.')
      );
    });

    this.stopPromise = new Promise((resolve, reject) => {
      this.queue.unshift({
        name: 'DETENER',
        resolve,
        reject
      });

      this.processQueue();
    });

    return this.stopPromise;
  }

  async processQueue() {
    if (this.processing) {
      return;
    }

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        const item = this.queue.shift();

        try {
          const command = this.getCommand(item.name);

          const response = await this.postCommand(command);

          if (
            item.name !== 'DETENER' &&
            this.stopRequested
          ) {
            item.reject(
              new Error('Movimiento sustituido por DETENER.')
            );
          } else {
            this.activeCommand =
              item.name === 'DETENER' ? null : item.name;

            item.resolve(response);
          }

        } catch (error) {
          item.reject(error);
        }

        if (item.name === 'DETENER') {
          this.stopRequested = false;
          this.stopPromise = null;
        }
      }
    } finally {
      this.processing = false;
    }
  }

  async postCommand(command) {
    const response = await requestJson(
      vehiclePath(API_CONFIG.paths.movement),
      {
        method: 'POST',
        body: {
          id_comando: command.id,
          origen: 'HTTP'
        }
      }
    );

    if (
      !response ||
      response.mensaje !== 'Movimiento registrado' ||
      response.id_vehiculo !== API_CONFIG.vehicleId ||
      response.id_comando !== command.id ||
      response.codigo !== command.code
    ) {
      throw new Error('Respuesta de movimiento inesperada.');
    }

    return response;
  }
}
