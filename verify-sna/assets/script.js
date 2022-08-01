const verificationsStatusSpan = document.getElementById('verifications-status');

function showVerificationsStatus(message, options = { color: 'gray' }) {
  verificationsStatusSpan.style.color = options.color;
  verificationsStatusSpan.textContent = message;
}

function showVerificationsError(error) {
  console.error(error);
  showVerificationsStatus(error, { color: '#a94442' });
}

function clearStatus() {
  verificationsStatusSpan.textContent = '';
}

async function getVerifications(event) {
  event.preventDefault();
  console.log('Getting verifications...');

  showVerificationsStatus('Getting verifications...');

  const data = new URLSearchParams();

  try {
    const response = await fetch('./get-verifications', {
      method: 'POST',
      body: data,
    });

    const json = await response.json();

    if (response.status === 200) {
      showVerificationsStatus(json.message, { color: 'green' });
      /**
       * Note: Here I have to update the UI with the verifications that were retrieved. For now, all the verifications are being printed out
       */
      console.log(json.verifications);
    } else {
      showVerificationsError(json.message);
    }
  } catch (error) {
    console.error(error);
    showVerificationsError('Something went wrong!');
  }
}

document
  .getElementById('get-verifications')
  .addEventListener('submit', (event) => getVerifications(event));
