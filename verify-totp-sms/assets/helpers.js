document.getElementById('session-reset').addEventListener('click', (event) => {
  event.preventDefault();
  sessionStorage.removeItem('name');
  sessionStorage.removeItem('identity');
  sessionStorage.removeItem('totpFactorSid');
  sessionStorage.removeItem('to');
  sessionStorage.removeItem('channel');
  window.location.reload(false);
});

function hide(element) {
  element.style.display = 'none';
}

function hideAll(className) {
  Array.from(document.getElementsByClassName(className)).forEach((elem) =>
    hide(elem)
  );
}

function clearStatus() {
  document.getElementById('status').textContent = '';
}

function showStatus(message, options = { color: 'gray' }) {
  clearStatus();
  const status = document.getElementById('status');
  status.style.color = options.color;
  status.textContent = message;
}

function showError(error) {
  console.error(error);
  showStatus(error, { color: '#a94442' });
}

function showModalStatus(message, options = { color: 'gray' }) {
  const modalStatus = document.getElementById('modal-status');
  modalStatus.style.color = options.color;
  modalStatus.textContent = message;
}

function showSessionData() {
  const identity = sessionStorage.getItem('identity');
  const friendlyName = sessionStorage.getItem('name');

  if (identity === null) {
    hide(document.getElementById('validate-code'));
  } else {
    document.getElementById(
      'session-data'
    ).textContent = `Demo is running for username '${friendlyName}' with identity '${identity}'.`;
    document.getElementById('validate-code').style.display = 'inline';
  }
}

showSessionData();

function clearPage() {
  clearStatus();
  hideAll('dynamic-render');
  hideAll('otp-form');
}
