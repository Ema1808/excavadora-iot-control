
import { MovementService } from '../js/services/movement.service.js';

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const commands = new Map([
  ['AVANZAR', { id: 39, code: 1 }],
  ['RETROCEDER', { id: 40, code: 2 }],
  ['GIRAR_DERECHA', { id: 42, code: 4 }],
  ['DETENER', { id: 47, code: 9 }]
]);

async function testMovementQueue() {
  const service = new MovementService(commands);

  const sent = [];

  // Sustituimos el envío HTTP por una simulación.
  // Ningún comando llega a AWS.
  service.postCommand = async (command) => {
    sent.push(command.id);

    console.log('[TEST] Procesando:', command.id);

    await wait(300);

    return {
      mensaje: 'Movimiento registrado',
      id_vehiculo: 7,
      id_comando: command.id,
      codigo: command.code
    };
  };

  const avanzar = service.send('AVANZAR');

  const girar = service.send('GIRAR_DERECHA');

  const detener = service.stop();

  const results = await Promise.allSettled([
    avanzar,
    girar,
    detener
  ]);

  console.log('[TEST] Orden enviado:', sent);
  console.log('[TEST] Resultados:', results);

  const correctOrder =
    sent.length === 2 &&
    sent[0] === 39 &&
    sent[1] === 47;

  const correctResults =
    results[0].status === 'rejected' &&
    results[1].status === 'rejected' &&
    results[2].status === 'fulfilled';

  if (correctOrder && correctResults) {
    console.log(
      '✅ PRUEBA SUPERADA: DETENER tuvo prioridad.'
    );
  } else {
    console.error(
      '❌ PRUEBA FALLIDA: revisar la cola.'
    );
  }
}

testMovementQueue().catch(console.error);
