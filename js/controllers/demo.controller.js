
export function initDemoController({
  loadMovements = async () => []
} = {}) {
  const select = document.getElementById('demo-select');
  const startButton = document.getElementById('demo-start');
  const cancelButton = document.getElementById('demo-cancel');

  if (!select || !startButton || !cancelButton) {
    throw new Error('No se encontraron los controles de DEMO.');
  }

  // SEGURIDAD: nunca ejecutar DEMO física desde este controlador.
  const REAL_EXECUTION_ENABLED = false;

  let demos = [];
  let running = false;
  let loading = false;
  let selectedDemo = null;

  let simulationId = 0;
  let simulationTimer = null;
  let resolveWait = null;
  let requestController = null;

  // ==========================================
  // 1. MENSAJES DE ESTADO
  // ==========================================

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

  // ==========================================
  // 2. CONTROL DE BOTONES
  // ==========================================

  function updateButtons() {
    const busy = running || loading;
    const hasSelection = selectedDemo !== null;

    select.disabled = demos.length === 0 || busy;
    startButton.disabled = !hasSelection || busy;
    cancelButton.disabled = !busy;
  }

  // ==========================================
  // 3. TEMPORIZADOR CANCELABLE
  // ==========================================

  function wait(ms, id) {
    return new Promise(resolve => {
      if (id !== simulationId) {
        resolve(false);
        return;
      }

      if (!Number.isFinite(ms) || ms < 0) {
        resolve(false);
        return;
      }

      resolveWait = resolve;

      simulationTimer = setTimeout(() => {
        simulationTimer = null;
        resolveWait = null;

        resolve(id === simulationId);
      }, ms);
    });
  }

  // ==========================================
  // 4. CANCELACIÓN INMEDIATA
  // ==========================================

  function cancelSimulation() {
    simulationId++;

    if (requestController) {
      requestController.abort();
      requestController = null;
    }

    if (simulationTimer !== null) {
      clearTimeout(simulationTimer);
      simulationTimer = null;
    }

    if (resolveWait !== null) {
      const resolve = resolveWait;
      resolveWait = null;
      resolve(false);
    }

    running = false;
    loading = false;

    updateButtons();
  }

  // ==========================================
  // 5. MOSTRAR CATÁLOGO DE DEMO
  // ==========================================

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

      if (running || loading) {
        cancelSimulation();

        showMessage(
          'La DEMO dejó de estar disponible en el catálogo.'
        );
      }
    }

    updateButtons();
  }

  // ==========================================
  // 6. SELECCIONAR DEMO
  // ==========================================

  select.addEventListener('change', () => {
    if (running || loading) return;

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

  // ==========================================
  // 7. REPRODUCCIÓN VISUAL DE MOVIMIENTOS
  // ==========================================

  async function runSimulation(demo, id) {
    if (REAL_EXECUTION_ENABLED) {
      showMessage(
        'La ejecución REST real permanece deshabilitada.'
      );
      return;
    }

    requestController = new AbortController();
    loading = true;

    updateButtons();

    showMessage(
      `Consultando movimientos de ${demo.name}...`
    );

    let movements;

    try {
      // Únicamente consulta GET.
      movements = await loadMovements(
        demo.id,
        requestController.signal
      );
    } catch (error) {
      if (id !== simulationId) return;

      loading = false;
      requestController = null;

      showMessage(
        'No se pudo consultar la secuencia DEMO: ' +
        (error?.message || 'Error desconocido.')
      );

      updateButtons();
      return;
    }

    if (id !== simulationId) return;

    requestController = null;
    loading = false;

    if (!Array.isArray(movements) || movements.length === 0) {
      showMessage(
        'Esta DEMO no tiene movimientos disponibles.'
      );

      updateButtons();
      return;
    }

    running = true;
    updateButtons();

    console.log('[DEMO SIMULACIÓN] Inicio', {
      id_demo: demo.id,
      nombre: demo.name,
      total_movimientos: movements.length,
      sentToApi: false
    });

    showMessage(
      `Simulación iniciada: ${demo.name}. ` +
      `${movements.length} movimientos.`
    );

    // ========================================
    // REPRODUCIR CADA MOVIMIENTO
    // ========================================

    for (let i = 0; i < movements.length; i++) {
      if (id !== simulationId) return;

      const movement = movements[i];

      const commandName = movement.command.replaceAll(
        '_',
        ' '
      );

      const duration = movement.durationMs;
      const pause = movement.pauseMs;

      console.log('[DEMO SIMULACIÓN] Movimiento', {
        paso: i + 1,
        total: movements.length,
        comando: movement.command,
        duracion_ms: duration,
        pausa_ms: pause,
        sentToApi: false
      });

      showMessage(
        `Simulación ${i + 1}/${movements.length}: ` +
        `${commandName} (${duration} ms). ` +
        'Sin ejecución física.'
      );

      // Simular duración del movimiento.
      const completed = await wait(duration, id);

      if (!completed) return;

      // Simular pausa entre movimientos.
      if (pause > 0) {
        showMessage(
          `Pausa después de ${commandName}: ` +
          `${pause} ms.`
        );

        const pauseCompleted = await wait(pause, id);

        if (!pauseCompleted) return;
      }
    }

    if (id !== simulationId) return;

    running = false;
    loading = false;

    console.log('[DEMO SIMULACIÓN] Finalización', {
      id_demo: demo.id,
      total_movimientos: movements.length,
      sentToApi: false
    });

    showMessage(
      `Simulación finalizada: ${demo.name}. ` +
      `${movements.length} movimientos completados. ` +
      'No se enviaron comandos físicos.'
    );

    updateButtons();
  }

  // ==========================================
  // 8. BOTÓN INICIAR
  // ==========================================

  startButton.addEventListener('click', () => {
    if (!selectedDemo || running || loading) return;

    if (REAL_EXECUTION_ENABLED) {
      showMessage(
        'La ejecución REST real permanece deshabilitada.'
      );
      return;
    }

    const demo = selectedDemo;
    const id = ++simulationId;

    void runSimulation(demo, id);
  });

  // ==========================================
  // 9. BOTÓN CANCELAR
  // ==========================================

  cancelButton.addEventListener('click', () => {
    if (!running && !loading) return;

    const demoId = selectedDemo?.id;

    cancelSimulation();

    console.log('[DEMO SIMULACIÓN] Cancelación', {
      id_demo: demoId,
      sentToApi: false
    });

    showMessage(
      'Simulación cancelada. ' +
      'No se enviaron comandos físicos a FastAPI.'
    );
  });

  // ==========================================
  // 10. INICIALIZACIÓN
  // ==========================================

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
      cancelSimulation();

      demos = [];
      selectedDemo = null;

      render();

      showMessage('No hay DEMO cargadas.');
    },

    isRunning() {
      return running || loading;
    },

    getSelectedDemo() {
      return selectedDemo;
    },

    reset() {
      cancelSimulation();
      updateButtons();
    }
  };
}
