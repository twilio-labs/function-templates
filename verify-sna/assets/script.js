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

const verificationsTable = document.getElementById('verifications-table');

const addAttributes = (element, attrObj) => {
  for (let attr in attrObj) {
    if (attrObj.hasOwnProperty(attr)) {
      element.setAttribute(attr, attrObj[attr]);
    }
  }
};

const createCustomElement = (element, attributes, children) => {
  let customElement = document.createElement(element);
  if (children !== undefined) {
    children.forEach((e) => {
      if (e.nodeType) {
        if (e.nodeType == 1 || e.nodeType == 11) {
          customElement.appendChild(e);
        }
      } else {
        customElement.innerHTML += e;
      }
    });
  }
  addAttributes(customElement, attributes);
  return customElement;
};

function newTableRow(verification) {
  // Phone number
  let phoneNumber = document.createElement('td');
  phoneNumber.innerHTML = verification.phone_number;

  // Verification start datetime
  let verificationStart = document.createElement('td');
  verificationStart.innerHTML = verification.verification_start_datetime;

  // Verification check datetime
  let verificationCheck = document.createElement('td');
  verificationCheck.innerHTML = verification.verification_check_datetime;

  // Status
  let statusSpan = document.createElement('span');
  statusSpan.classList.add(verification.status);
  if (verification.status === 'verified') {
    statusSpan.innerHTML = 'Verified';
  } else if (verification.status === 'pending') {
    statusSpan.innerHTML = 'Pending';
  } else if (verification.status === 'not-verified') {
    statusSpan.innerHTML = 'Not verified';
  } else {
    statusSpan.innerHTML = 'Expired';
  }
  let status = createCustomElement('td', { class: 'status' }, [statusSpan]);

  // Create new row
  return createCustomElement('tr', {}, [
    phoneNumber,
    verificationStart,
    verificationCheck,
    status,
  ]).outerHTML;
}

function updateVerificationsTable(verifications) {
  let newTableBody = '';
  verifications.forEach((verification) => {
    newTableBody = `${newTableBody}${newTableRow(verification)}\n`;
  });
  verificationsTable.tBodies[0].innerHTML = newTableBody;
  console.log(verificationsTable.tBodies[0]);
}

async function getVerifications(event) {
  event.preventDefault();
  console.log('Getting verifications...');

  // showVerificationsStatus('Getting verifications...');

  const data = new URLSearchParams();

  try {
    const response = await fetch('./get-verifications', {
      method: 'POST',
      body: data,
    });

    const json = await response.json();

    if (response.status === 200) {
      // showVerificationsStatus(json.message, { color: 'green' });
      updateVerificationsTable(json.verifications);
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
