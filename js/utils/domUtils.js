// DOM manipulation helper functions

export function createElement(tag, options = {}) {
  const element = document.createElement(tag);

  if (options.className) {
    element.className = options.className;
  }

  if (options.textContent) {
    element.textContent = options.textContent;
  }

  if (options.attributes) {
    for (const [key, value] of Object.entries(options.attributes)) {
      element.setAttribute(key, value);
    }
  }

  if (options.listeners) {
    for (const [event, handler] of Object.entries(options.listeners)) {
      element.addEventListener(event, handler);
    }
  }

  return element;
}

export function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function appendChildren(parent, children) {
  for (const child of children) parent.appendChild(child);
}

export function removeAllChildren(element) {
  for (const child of element.querySelectorAll("*")) {
    child.remove();
  }
}

export function toggleClass(element, className) {
  element.classList.toggle(className);
}

export function getSelectedNotebookId() {
  const selectedNotebook = document.querySelector(".notebook-selected");
  return selectedNotebook ? selectedNotebook.dataset.id : null;
}

export function getById(id) {
  return document.getElementById(id);
}

export function getValue(element) {
  return element.value.trim();
}
