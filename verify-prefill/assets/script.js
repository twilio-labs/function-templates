let maxCalls = 0;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function displayLoadingSkeleton() {
  document.querySelectorAll('.loading-bar').forEach(function (el) {
    el.style.display = 'block';
  });
}

function hideLoadingSkeleton() {
  document.querySelectorAll('.loading-bar').forEach(function (el) {
    el.style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('otp-form');
  const inputs = [...form.querySelectorAll('input[type=text]')];
  const submit = document.getElementById('submit-otp');

  const handleKeyDown = (e) => {
    if (
      !/^[0-9]{1}$/.test(e.key) &&
      e.key !== 'Backspace' &&
      e.key !== 'Delete' &&
      e.key !== 'Tab' &&
      !e.metaKey
    ) {
      e.preventDefault();
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      const index = inputs.indexOf(e.target);
      if (index > 0) {
        inputs[index - 1].value = '';
        inputs[index - 1].focus();
      }
    }
  };

  const handleInput = (e) => {
    const { target } = e;
    const index = inputs.indexOf(target);
    if (target.value) {
      if (index < inputs.length - 1) {
        inputs[index + 1].focus();
      } else {
        submit.focus();
      }
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    if (!new RegExp(`^[0-9]{${inputs.length}}$`).test(text)) {
      return;
    }
    const digits = text.split('');
    inputs.forEach((input, index) => {
      input.value = digits[index];
    });
    submit.focus();
  };

  inputs.forEach((input) => {
    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', handleKeyDown);
    input.addEventListener('focus', handleFocus);
    input.addEventListener('paste', handlePaste);
  });
});

function displayUserData(data) {
  document.getElementById('first-name').innerText = data.first_name;
  document.getElementById('last-name').innerText = data.last_name;
  document.getElementById('address-line').innerText = data.address_line;
  document.getElementById('country-code').innerText = data.country_code;
  document.getElementById('state').innerText = data.state;
  document.getElementById('postal-code').innerText = data.postal_code;
}

async function fetchUserData(phoneNumber, verificationSid, waitTime = 15000) {
  try {
    await wait(waitTime);
    console.log('Attempting fetch...');

    const response = await fetch('/fetch-user-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, verificationSid }),
    });
    const result = await response.json();
    if (result.prefillData.error_code === null) {
      console.log(result);
      console.log(result.prefillData);
      hideLoadingSkeleton();
      displayUserData(result.prefillData);
    } else {
      console.log(`Fetching user data failed: ${result.message}`);
      // Resursively call until we get a result...
      if (maxCalls < 50) {
        fetchUserData(phoneNumber, verificationSid, 3000);
        maxCalls += 1;
      } else {
        // eslint-disable-next-line no-alert
        alert(
          'Unable to call Lookup API successfully. Do you have access to pre-fill?'
        );
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function sendOTP() {
  const phoneNumber = document.getElementById('phone-number').value;
  const otpFormDigits = document.getElementsByClassName('otp-digit');
  const firstDigit = otpFormDigits[0];

  const response = await fetch('/send-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber }),
  });
  const result = await response.json();
  firstDigit.focus();

  // eslint-disable-next-line no-alert
  alert(result.message);
}

async function verifyOTP() {
  const phoneNumber = document.getElementById('phone-number').value;

  const otpInputs = document.querySelectorAll('input.otp-digit');
  const otpValues = [];
  otpInputs.forEach((input) => {
    otpValues.push(input.value);
  });

  const code = otpValues.join('');

  console.log(phoneNumber, code);
  const response = await fetch('/verify-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber, code }),
  });

  const result = await response.json();

  if (result.success) {
    console.log(
      'Verification successful. Fetching user data every 15 seconds...'
    );
    console.log(result.verificationSid);
    displayLoadingSkeleton();
    fetchUserData(phoneNumber, result.verificationSid);
  } else {
    // eslint-disable-next-line no-alert
    alert(`Verification failed: ${result.message}`);
  }
}
