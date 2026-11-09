
const MAX_EVENTS = 20;

export function initActivity() {
  const container = document.getElementById('activity-history');

  if (!container) {
    throw new Error('No se encontró el historial de actividad.');
  }

  function add(command, source = 'Simulación local') {
    const item = document.createElement('li');
    const time = new Date().toLocaleTimeString('es-MX');

    item.className = 'activity-item';

    const title = document.createElement('strong');
    title.textContent = command;

    const detail = document.createElement('span');
    detail.textContent = `${time} · ${source}`;

    item.append(title, detail);
    container.prepend(item);

    while (container.children.length > MAX_EVENTS) {
      container.lastElementChild.remove();
    }
  }

  function clear() {
    container.replaceChildren();
  }

  return { add, clear };
}
