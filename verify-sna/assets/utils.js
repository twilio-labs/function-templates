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
  phoneNumber.innerHTML = `+${'*'.repeat(
    verification.phone_number.length - 5
  )}${verification.phone_number.slice(-4)}`;

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
    newTableBody = `${newTableBody}${newTableRow(verification)}`;
  });
  verificationsTable.tBodies[0].innerHTML = newTableBody;
}

async function fetchVerifications() {
  try {
    const response = await fetch('./get-verifications', {
      method: 'GET',
    });
    const json = await response.json();

    if (response.status == 502) {
      await fetchVerifications();
    } else if (response.status != 200) {
      console.error(json.message);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await fetchVerifications();
    } else {
      updateVerificationsTable(json.verifications);
      await new Promise((resolve) => setTimeout(resolve, 10000));
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

    if (response.status == 502) {
      await removeVerifications();
    } else if (response.status != 200) {
      console.error(json.message);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await removeVerifications();
    } else {
      await new Promise((resolve) => setTimeout(resolve, 60000 * 30));
      await removeVerifications();
    }
  } catch (error) {
    console.error(error);
  }
}

fetchVerifications();

removeVerifications();
