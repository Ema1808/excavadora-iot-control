export function setStatus(id, state, label) {
  const element = document.getElementById(id);
  if (!element) return;
  element.dataset.state = state;
  element.textContent = label;
}
export function setMessage(message) {
  const element = document.getElementById('action-message');
  if (element) element.textContent = message;
}
