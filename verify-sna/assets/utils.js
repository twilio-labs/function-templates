const startVerificationsRetrievalStatusSpan = document.getElementById(
  'start-verifications-retrieval-status'
);
const ldsDualRingDiv = document.getElementById('lds-dual-ring');
const startVerificationsRetrievalButtonInput = document.getElementById(
  'start-verifications-retrieval-button'
);

const TIME_LIMIT = 180;

function showStartVerificationsRetrievalStatus(
  message,
  options = { color: 'gray' }
) {
  startVerificationsRetrievalStatusSpan.style.color = options.color;
  startVerificationsRetrievalStatusSpan.textContent = message;
}

function showStartVerificationsRetrievalError(error) {
  console.error(error);
  showStartVerificationsRetrievalStatus(error, { color: '#a94442' });
}

function clearStatus() {
  startVerificationsRetrievalStatusSpan.textContent = '';
}

function formatTimeLeft(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${minutes}:${seconds}`;
}

const verificationsTable = document.getElementById('verifications-table');

const addAttributes = (element, attrObj) => {
  for (const attr in attrObj) {
    if (attrObj.hasOwnProperty(attr)) {
      element.setAttribute(attr, attrObj[attr]);
    }
  }
};

const createCustomElement = (element, attributes, children) => {
  const customElement = document.createElement(element);
  if (children !== undefined) {
    children.forEach((e) => {
      if (e.nodeType) {
        if (e.nodeType === 1 || e.nodeType === 11) {
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
  const phoneNumber = document.createElement('td');
  phoneNumber.innerHTML = `+${'*'.repeat(
    verification.phoneNumber.length - 5
  )}${verification.phoneNumber.slice(-4)}`;

  // Verification start datetime
  const verificationStartDatetime = document.createElement('td');
  verificationStartDatetime.innerHTML = verification.verificationStartDatetime;

  // Verification check datetime
  const verificationCheckDatetime = document.createElement('td');
  verificationCheckDatetime.innerHTML = verification.verificationCheckDatetime;

  // Status
  const statusSpan = document.createElement('span');
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
  const status = createCustomElement('td', { class: 'status' }, [statusSpan]);

  // Create new row
  return createCustomElement('tr', {}, [
    phoneNumber,
    verificationStartDatetime,
    verificationCheckDatetime,
    status,
  ]).outerHTML;
}

function updateVerificationsTable(verifications) {
  let newTableBody = '';
  if (verifications.length === 0) {
    const emptyTableStateTh = createCustomElement('th', { colspan: '4' }, [
      'No verifications to show',
    ]);
    newTableBody = createCustomElement('tr', { class: 'empty-table-state' }, [
      emptyTableStateTh,
    ]).outerHTML;
  } else {
    verifications.forEach((verification) => {
      newTableBody = `${newTableBody}${newTableRow(verification)}`;
    });
  }
  verificationsTable.tBodies[0].innerHTML = newTableBody;
}

async function fetchVerifications() {
  try {
    const response = await fetch('./get-verifications', {
      method: 'GET',
    });
    const json = await response.json();

    if (response.status === 502) {
      await fetchVerifications();
    } else if (response.status === 200) {
      updateVerificationsTable(json.verifications);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await fetchVerifications();
    }
  } catch (error) {
    console.error(error);
  }
}

async function removeVerifications() {
  try {
    const response = await fetch('./remove-old-verifications', {
      method: 'GET',
    });
    const json = await response.json();

    if (response.status === 502) {
      await removeVerifications();
    } else if (response.status === 200) {
      await new Promise((resolve) => setTimeout(resolve, 60000 * 30));
      await removeVerifications();
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await removeVerifications();
    }
  } catch (error) {
    console.error(error);
  }
}

async function startVerificationsRetrieval(event) {
  event.preventDefault();
  let timePassed = 0;
  let timeLeft = TIME_LIMIT;
  try {
    ldsDualRingDiv.style.display = 'inline-block';
    document.getElementById('lds-dual-ring-span').innerHTML =
      formatTimeLeft(timeLeft);
    showStartVerificationsRetrievalStatus('Fetching verifications');
    startVerificationsRetrievalButtonInput.disabled = true;

    // fetch verifications
    const fetchVerificationsIntervalID = setInterval(fetchVerifications, 5000);
    // update timer
    const updateTimerIntervalID = setInterval(() => {
      timePassed += 1;
      timeLeft = TIME_LIMIT - timePassed;
      document.getElementById('lds-dual-ring-span').innerHTML =
        formatTimeLeft(timeLeft);
    }, 1000);
    await new Promise((resolve) => setTimeout(resolve, 180000));
    clearInterval(updateTimerIntervalID);
    clearInterval(fetchVerificationsIntervalID);

    ldsDualRingDiv.style.display = 'none';
    showStartVerificationsRetrievalStatus(
      'Verifications retrieved successfully',
      { color: 'green' }
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));
    clearStatus();
    startVerificationsRetrievalButtonInput.disabled = false;
  } catch (error) {
    console.error(error);
    showStartVerificationsRetrievalError(
      'Something went wrong! Please try again'
    );
  }
}

document
  .getElementById('start-verifications-retrieval')
  .addEventListener('submit', (event) => startVerificationsRetrieval(event));

removeVerifications();
