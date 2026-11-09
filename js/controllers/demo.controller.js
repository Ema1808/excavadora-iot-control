
export function initDemoController() {
  const select = document.getElementById('demo-select');
  const startButton = document.getElementById('demo-start');
  const cancelButton = document.getElementById('demo-cancel');

  if (!select || !startButton || !cancelButton) {
    throw new Error('No se encontraron los controles de DEMO.');
  }

  const REAL_EXECUTION_ENABLED = false;

  let demos = [];
  let running = false;
  let selectedDemo = null;

  function showMessage(message) {
    console.log('[DEMO]', message);

    let element = document.getElementById(
      'demo-status-message'
    );

    if (!element) {
      element = document.createElement('p');
      element.id = 'demo-status-message';
      element.setAttribute('role', 'status');
      element.setAttribute('aria-live', 'polite');
      element.className = 'mt-3 mb-0';

      cancelButton.parentElement.append(element);
    }

    element.textContent = message;
  }

  function updateButtons() {
    const hasSelection = selectedDemo !== null;

    select.disabled = demos.length === 0 || running;
    startButton.disabled = !hasSelection || running;
    cancelButton.disabled = !running;
  }

  function render() {
    const previousId = selectedDemo?.id ?? null;

    select.replaceChildren();

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = demos.length
      ? 'Selecciona una DEMO'
      : 'No hay DEMO disponibles';

    select.append(placeholder);

    for (const demo of demos) {
      const option = document.createElement('option');
      option.value = String(demo.id);
      option.textContent = demo.name;
      select.append(option);
    }

    selectedDemo = demos.find(
      demo => demo.id === previousId
    ) || null;

    if (selectedDemo) {
      select.value = String(selectedDemo.id);
    } else {
      select.value = '';

      if (running) {
        running = false;
        showMessage(
          'La DEMO dejó de estar disponible en el catálogo.'
        );
      }
    }

    updateButtons();
  }

  select.addEventListener('change', () => {
    if (running) return;

    selectedDemo = demos.find(
      demo => String(demo.id) === select.value
    ) || null;

    if (selectedDemo) {
      console.log('[DEMO local]', selectedDemo);
      showMessage(
        `DEMO seleccionada: ${selectedDemo.name}`
      );
    } else {
      showMessage('Selecciona una DEMO.');
    }

    updateButtons();
  });

  startButton.addEventListener('click', () => {
    if (!selectedDemo || running) return;

    if (REAL_EXECUTION_ENABLED) {
      showMessage(
        'La ejecución REST real permanece deshabilitada.'
      );
      return;
    }

    running = true;

    console.log('[DEMO SIMULACIÓN] Inicio', {
      id_demo: selectedDemo.id,
      nombre: selectedDemo.name,
      sentToApi: false
    });

    showMessage(
      `Simulación iniciada: ${selectedDemo.name}. ` +
      'No se enviaron movimientos a FastAPI.'
    );

    updateButtons();
  });

  cancelButton.addEventListener('click', () => {
    if (!running) return;

    if (REAL_EXECUTION_ENABLED) {
      showMessage(
        'La cancelación REST real permanece deshabilitada.'
      );
      return;
    }

    running = false;

    console.log('[DEMO SIMULACIÓN] Cancelación', {
      id_demo: selectedDemo?.id,
      sentToApi: false
    });

    showMessage(
      'Simulación cancelada. ' +
      'No se enviaron solicitudes a FastAPI.'
    );

    updateButtons();
  });

  render();

  return {
    setDemos(data) {
      if (!Array.isArray(data)) {
        throw new Error('El catálogo de DEMO no es válido.');
      }

      demos = [...data];
      render();
    },

    clear() {
      demos = [];
      selectedDemo = null;
      running = false;
      render();
      showMessage('No hay DEMO cargadas.');
    },

    isRunning() {
      return running;
    },

    getSelectedDemo() {
      return selectedDemo;
    },

    reset() {
      running = false;
      updateButtons();
    }
  };
}
