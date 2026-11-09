
const BUTTON_COMMANDS = Object.freeze([
  'SUBIR_BRAZO',
  'BAJAR_BRAZO',
  'ABRIR_PALA',
  'CERRAR_PALA'
]);

export function initButtons(onMovement = () => {}) {
  const buttons = [
    ...document.querySelectorAll('.action-btn[data-command]')
  ];

  if (buttons.length !== BUTTON_COMMANDS.length) {
    throw new Error(
      'No se encontraron todos los botones de movimiento.'
    );
  }

  let enabled = false;

  function handleCommand(command) {
    if (!enabled || !BUTTON_COMMANDS.includes(command)) {
      return;
    }

    onMovement(command, 'Botón');
  }

  buttons.forEach((button) => {
    const command = button.dataset.command;

    if (!BUTTON_COMMANDS.includes(command)) {
      throw new Error(`Comando no permitido: ${command}`);
    }

    button.addEventListener('click', () => {
      handleCommand(command);
    });
  });

  return {
    enable() {
      enabled = true;

      buttons.forEach((button) => {
        button.disabled = false;
      });
    },

    disable() {
      enabled = false;

      buttons.forEach((button) => {
        button.disabled = true;
      });
    }
  };
}
