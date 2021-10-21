document.getElementById('session-reset').addEventListener('click', (event) => {
  event.preventDefault();
  sessionStorage.removeItem('name');
  sessionStorage.removeItem('identity');
  sessionStorage.removeItem('totpFactorSid');
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

function showExplainer(name) {
  hideAll('explainer');
  document.getElementById(name).style.display = 'block';
}

function clearStatus() {
  hideAll('explainer');
  document.getElementById('status').textContent = '';
}

function showStatus(message, color = 'gray') {
  clearStatus();
  const status = document.getElementById('status');
  status.style.color = color;
  status.textContent = message;
}

function showError(error) {
  console.error(error);
  showStatus(error, (color = '#a94442'));
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
