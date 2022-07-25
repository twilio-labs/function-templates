const phoneStatusSpan = document.getElementById('phone-status');
const verificationStatusSpan = document.getElementById('verification-status');

function showPhoneStatus(message, options = { color: 'gray' }) {
  phoneStatusSpan.style.color = options.color;
  phoneStatusSpan.textContent = message;
}

function showVerificationStatus(message, options = { color: 'gray' }) {
  verificationStatusSpan.style.color = options.color;
  verificationStatusSpan.textContent = message;
}

function showPhoneError(error) {
  console.error(error);
  showPhoneStatus(error, { color: '#a94442' });
}

function showVerificationError(error) {
  console.error(error);
  showVerificationStatus(error, { color: '#a94442' });
}

function clearStatus() {
  phoneStatusSpan.textContent = '';
  verificationStatusSpan.textContent = '';
}

const countryCode = document.getElementById('country-code');
const phoneNumber = document.getElementById('phone-number');

async function getSNAUrl(event) {
  event.preventDefault();
  console.log('Retrieving SNA URL for verification...');
  console.log('Country code: ' + countryCode.value);
  console.log('Phone number: ' + phoneNumber.value);

  let statusMessage = 'Retrieving SNA URL for verification...';
  showPhoneStatus(statusMessage);

  const data = new URLSearchParams();
  data.append('countryCode', countryCode.value);
  data.append('phoneNumber', phoneNumber.value);

  try {
    const response = await fetch('./start-verify', {
      method: 'POST',
      body: data,
    });

    const json = await response.json();
    if (response.status == 200) {
      showPhoneStatus(
        `SNA URL for +${
          countryCode.value + phoneNumber.value
        } retrieved successfully`,
        { color: 'green' }
      );

      // The application uses the URL to perform the verification
    } else {
      clearStatus();
      showPhoneError(json.message);
    }
  } catch (error) {
    console.error(error);
    showPhoneError(
      `Something went wrong while retrieveing SNA URL for +${
        countryCode.value + phoneNumber.value
      }.`
    );
  }
}

document
  .getElementById('retrieve-sna-url')
  .addEventListener('submit', (event) => getSNAUrl(event));

async function checkVerification(event) {
  event.preventDefault();
  console.log('Checking verification...');
  console.log('Country code: ' + countryCode.value);
  console.log('Phone number: ' + phoneNumber.value);

  showVerificationStatus('Checking verification...');

  const data = new URLSearchParams();
  data.append('countryCode', countryCode.value);
  data.append('phoneNumber', phoneNumber.value);

  try {
    const response = await fetch('./check-verify', {
      method: 'POST',
      body: data,
    });

    const json = await response.json();
    if (response.status == 200) {
      showVerificationStatus(json.message, { color: 'green' });

      // The application is able to continue before the phone number is verified
    } else {
      showVerificationError(json.message);

      // The application has to verify the user using other verification methods
    }
  } catch (error) {
    console.error(error);
    showVerificationError('Something went wrong!');

    // The application has to verify the user using other verification methods
  }
}

document
  .getElementById('check-verification')
  .addEventListener('submit', (event) => checkVerification(event));
