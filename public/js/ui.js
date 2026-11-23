import { TOAST_DURATION_MS } from './constants.js';

let toastTimeout = null;

export function showToast(message, type = 'info') {
  const region = document.getElementById('toast-region');
  if (!region) return;

  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }
  region.textContent = '';

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  region.appendChild(toast);

  toastTimeout = setTimeout(() => {
    region.textContent = '';
    toastTimeout = null;
  }, TOAST_DURATION_MS);
}

export function confirmDialog({ title, message, okLabel = '확인', danger = false }) {
  const dialog = document.getElementById('confirm-dialog');
  const titleEl = document.getElementById('confirm-title');
  const msgEl = document.getElementById('confirm-message');
  const okBtn = document.getElementById('confirm-ok-btn');
  const cancelBtn = document.getElementById('confirm-cancel-btn');

  if (!dialog || !titleEl || !msgEl || !okBtn) {
    return Promise.resolve(false);
  }

  titleEl.textContent = title;
  msgEl.textContent = message;
  okBtn.textContent = okLabel;

  if (danger) {
    okBtn.className = 'btn btn--danger';
  } else {
    okBtn.className = 'btn btn--primary';
  }

  return new Promise((resolve) => {
    function handleClose() {
      dialog.removeEventListener('close', handleClose);
      resolve(dialog.returnValue === 'ok');
    }

    dialog.addEventListener('close', handleClose);
    dialog.showModal();
    if (cancelBtn) cancelBtn.focus();
  });
}

export function setButtonLoading(button, text = null) {
  if (!button) return;
  if (text) {
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.dataset.originalText = button.textContent;
    button.textContent = '';

    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    spinner.setAttribute('aria-hidden', 'true');

    button.appendChild(spinner);
    button.appendChild(document.createTextNode(' ' + text));
  } else {
    button.removeAttribute('aria-busy');
    if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  }
}

export function clearFieldErrors() {
  const errorEls = document.querySelectorAll('.field__error');
  for (const el of errorEls) {
    el.textContent = '';
    el.hidden = true;
  }
  const invalidInputs = document.querySelectorAll('[aria-invalid="true"]');
  for (const input of invalidInputs) {
    input.removeAttribute('aria-invalid');
  }
}

export function showFieldErrors(errors) {
  clearFieldErrors();
  if (!errors || errors.length === 0) return;

  let firstInput = null;

  for (const err of errors) {
    const errorEl = document.getElementById(`${err.inputId}-error`);
    const inputEl = document.getElementById(err.inputId);

    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    }
    if (inputEl) {
      inputEl.setAttribute('aria-invalid', 'true');
      if (!firstInput) firstInput = inputEl;
    }

    // 경험 메모에 에러가 있으면 details 펼침
    if (err.inputId && err.inputId.startsWith('exp-')) {
      const details = document.getElementById('experience-details');
      if (details) details.open = true;
    }
  }

  if (firstInput) {
    firstInput.focus();
  }
}
