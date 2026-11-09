
const DIRECTIONS = Object.freeze({
  UP: 'AVANZAR',
  DOWN: 'RETROCEDER',
  LEFT: 'GIRAR_IZQUIERDA',
  RIGHT: 'GIRAR_DERECHA'
});

export function initJoystick(onMovement = () => {}) {
  const joystick = document.getElementById('joystick');
  const knob = document.getElementById('joystick-knob');
  const label = document.getElementById('movement-label');

  if (!joystick || !knob || !label) {
    throw new Error('No se encontraron los elementos del joystick.');
  }

  let activePointer = null;
  let currentDirection = 'NEUTRAL';
  let enabled = false;

  const pressedKeys = new Set();

  const keyDirections = {
    ArrowUp: DIRECTIONS.UP,
    ArrowDown: DIRECTIONS.DOWN,
    ArrowLeft: DIRECTIONS.LEFT,
    ArrowRight: DIRECTIONS.RIGHT
  };

  function updateDirection(direction, x = 0, y = 0) {
    const changed = currentDirection !== direction;

    currentDirection = direction;
    label.textContent = direction;

    knob.style.setProperty('--joystick-x', `${x}px`);
    knob.style.setProperty('--joystick-y', `${y}px`);

    if (changed && enabled) {
      console.log('[Joystick local]', direction);
      onMovement(direction, 'Joystick');
    }
  }

  function reset() {
    activePointer = null;
    pressedKeys.clear();
    updateDirection('NEUTRAL', 0, 0);
  }

  function handlePointer(event) {
    if (!enabled || activePointer !== event.pointerId) {
      return;
    }

    const rect = joystick.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;

    const distance = Math.hypot(dx, dy);
    const threshold = Math.min(rect.width, rect.height) * 0.12;

    if (distance < threshold) {
      updateDirection('NEUTRAL');
      return;
    }

    const maxOffset = Math.min(rect.width, rect.height) * 0.25;
    const scale = Math.min(1, maxOffset / distance);

    let direction;

    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0
        ? DIRECTIONS.RIGHT
        : DIRECTIONS.LEFT;
    } else {
      direction = dy > 0
        ? DIRECTIONS.DOWN
        : DIRECTIONS.UP;
    }

    updateDirection(direction, dx * scale, dy * scale);
  }

  joystick.addEventListener('pointerdown', (event) => {
    if (!enabled || activePointer !== null) return;

    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    pressedKeys.clear();
    activePointer = event.pointerId;

    joystick.setPointerCapture(event.pointerId);
    handlePointer(event);
  });

  joystick.addEventListener('pointermove', handlePointer);

  function releasePointer(event) {
    if (event.pointerId !== activePointer) return;

    reset();

    if (joystick.hasPointerCapture(event.pointerId)) {
      joystick.releasePointerCapture(event.pointerId);
    }
  }

  joystick.addEventListener('pointerup', releasePointer);
  joystick.addEventListener('pointercancel', releasePointer);

  joystick.addEventListener('lostpointercapture', (event) => {
    if (event.pointerId === activePointer) {
      reset();
    }
  });

  function updateKeyboard() {
    const lastKey = [...pressedKeys].at(-1);

    if (!lastKey) {
      updateDirection('NEUTRAL');
      return;
    }

    const direction = keyDirections[lastKey];
    const offset = 35;

    const positions = {
      AVANZAR: [0, -offset],
      RETROCEDER: [0, offset],
      GIRAR_IZQUIERDA: [-offset, 0],
      GIRAR_DERECHA: [offset, 0]
    };

    updateDirection(direction, ...positions[direction]);
  }

  joystick.addEventListener('keydown', (event) => {
    if (!enabled || !keyDirections[event.key]) return;

    event.preventDefault();

    if (activePointer !== null) return;

    pressedKeys.add(event.key);
    updateKeyboard();
  });

  joystick.addEventListener('keyup', (event) => {
    if (!keyDirections[event.key]) return;

    event.preventDefault();

    pressedKeys.delete(event.key);

    if (activePointer === null) {
      updateKeyboard();
    }
  });

  joystick.addEventListener('blur', reset);
  window.addEventListener('blur', reset);

  reset();

  return {
    enable() {
      enabled = true;
      joystick.setAttribute('aria-disabled', 'false');
    },

    disable() {
      enabled = false;
      joystick.setAttribute('aria-disabled', 'true');
      reset();
    },

    reset() {
      reset();
    },

    getDirection() {
      return currentDirection;
    }
  };
}
