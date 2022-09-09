let passcode;

function updateCurlCommandTextBox(kind, passcode) {
  let text;
  switch (kind) {
    case 'linux':
      text = `curl -X POST ${window.location.origin}/token \\
  --data-urlencode "passcode=${passcode || ''}" \\
  --data-urlencode "identity=user" \\
  --data-urlencode "room_name=cool room"`;
      break;
    case 'windows-curl':
      text = `curl -X POST ${window.location.origin}/token ^
  --data-urlencode "passcode=${passcode || ''}" ^
  --data-urlencode "identity=user" ^
  --data-urlencode "room_name=cool room"`;
      break;
    case 'windows-powershell':
      text = `Invoke-WebRequest -Method POST -Uri "${window.location.origin}/token" \`
  -Body @{passcode='${passcode}'; \`
          identity='user'; \`
          room_name='cool room'}`;
      break;
    default:
      break;
  }
  const textarea = document.getElementById('curl-commands');
  textarea.value = text;
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function updateEnvTextBox(passcode) {
  const text = `TWILIO_TOKEN_BASE_URL=${window.location.origin}
TWILIO_TOKEN_PASSCODE=${passcode || ''}`;

  const textarea = document.getElementById('env-file');
  textarea.value = text;
}

// from ce-helpers.js
inputPrependBaseURL();
handleCopyToClipboard();

document.querySelector('.tabs').addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    document
      .querySelectorAll('.tabs button')
      .forEach((el) => el.classList.remove('active'));
    e.target.classList.add('active');
    updateCurlCommandTextBox(e.target.dataset.tab, passcode);
  }
});

document.querySelectorAll('.copy-textarea-wrapper .copy-button').forEach((el) =>
  el.addEventListener('click', (e) => {
    e.preventDefault();
    navigator.clipboard
      .writeText(el.parentElement.querySelector('textarea').value)
      .then(() => {
        el.classList.add('copied');
        setTimeout(() => el.classList.remove('copied'), 5000);
      })
      .catch(() => console.error('Error copying text to clipboard'));
  })
);

// The /initialize route requires this parameter so plain GET requests can't trigger an initialization
fetch('/initialize?initialize=true')
  .then((res) => res.json())
  .then((res) => {
    if (res.passcode) {
      // eslint-disable-next-line prefer-destructuring
      passcode = res.passcode;
      document.getElementById('passcode-generated').style.display = 'block';
      updateCurlCommandTextBox('linux', res.passcode);
      updateEnvTextBox(res.passcode);
      document.getElementById('token-server-passcode').value = res.passcode;
    } else {
      document.getElementById('passcode-already-generated').style.display =
        'block';
      updateCurlCommandTextBox('linux');
      updateEnvTextBox();
    }
  })
  .catch((e) => {
    console.error('Error initializing token server:', e);
    document.getElementById('passcode-already-generated').style.display =
      'block';
    updateCurlCommandTextBox('linux');
    updateEnvTextBox();
  });
