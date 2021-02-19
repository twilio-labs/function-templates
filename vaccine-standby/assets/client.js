/* eslint-disable no-console */
/* eslint-disable no-undef */
let phoneNumber;
let flowSid;

// eslint-disable-next-line no-restricted-globals
const baseUrl = new URL(location.href);
baseUrl.pathname = baseUrl
  .pathname
  .replace(/\/index\.html$/, '');
delete baseUrl.hash;
delete baseUrl.search;
const fullUrl = baseUrl
  .href
  .substr(0, baseUrl.href.length - 1);

fetch(`${fullUrl}/return-config`)
  .then((response) => response.json())
  .then((json) => {
    phoneNumber = json.phone_number;
    // Grab the phone number being used and display it to help the user test their app
    const phoneNumberElements = $('.phone-number');
    phoneNumberElements.html(phoneNumber);
  });

function checkStudioFlow() {
  fetch('/check-existing-flow')
    .then((response) => response.text())
    .then((sid) => {
      $('#deploy-flow .button').removeClass('loading');
      $('.loader').hide();
      if (sid === 'none') {
        $('#deploy-flow').show();
      } else {
        flowSid = sid;
        $('#flow-deployed').show();
        $('#deploy-flow').hide();
        $('.post-deploy-studio').show();
        $('#password-form').show();
        $('#open-studio').attr('href', `https://www.twilio.com/console/studio/flows/${sid}`);
        $('.execution-logs-link').attr('href', `https://www.twilio.com/console/studio/flows/${sid}/executions`);
      }
    })
    .catch((err) => {
      console.log('An error occurred when attempting to check the Studio Flow', err);
    });
}

// eslint-disable-next-line no-unused-vars
function setup(e) {
  e.preventDefault();
  $('#deploy-flow .button').addClass('loading');
  $('.loader.button-loader').show();

  fetch('/setup').then(() => {
    checkStudioFlow();
  })
  .catch((err) => {
    console.log('An error ocurred creating Studio Flow', err);
    $('#deploy-flow .button').removeClass('loading');
    $('.loader.button-loader').hide();
  });
}

function updateTable(data) {
  const tbody = $('#residents-table-body');
  let rows = '';
  for (let i = 0; i < data.length; i += 1) {
    if (data[i]) {
      let tr = '<tr>';
      tr += `<td>${data[i].name}</td>`;
      tr += `<td>${data[i].phone_number}</td>`;
      tr += `<td>${data[i].age}</td>`;
      tr += `<td>${data[i].zip_code}</td>`;
      tr += `<td>${data[i].essential_worker}</td>`;
      tr += `<td>${data[i].work_from_home}</td>`;
      tr += `<td>${data[i].long_term_care}</td>`;
      tr += `<td>${data[i].congregate_setting}</td>`;
      tr += `<td>${data[i].health_condition}</td>`;
      tr += `<td>${data[i].notification_preference}</td>`;
      tr += `<td>${data[i].language_preference}</td>`;
      tr += '</tr>';

      rows = rows.concat(tr);
    }
  }
  tbody.html(rows);
}

function getStudioExecutions(sid, token) {
  const tbody = $('#residents-table-body');
  fetch(`/get-studio-executions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: token }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        updateTable(data);
      } else {
        tbody.html(`<tr class="table-placeholder"><td colspan="11">No records yet. Send a text message to <strong class="phone-number">${phoneNumber}</strong> to begin.</td></tr>`);
      }
    })
    .catch((err) => {
      console.log(err)
      tbody.html(`<tr class="table-placeholder"><td colspan="11" style="color: red">There was an error when attempting to fetch Studio Logs. Refresh the page to try again or see troubleshooting steps below.</td></tr>`);
    });
}

function getStudioData(token) {
  $('#test-standby-list').show();
  clearInterval(getStudioExecutions);
  getStudioExecutions(flowSid, token);
  setInterval(getStudioExecutions, 3000, flowSid, token);
}

// eslint-disable-next-line no-unused-vars
async function login(e) {
  e.preventDefault();

  const passwordInput = $('#password-input').val();
  fetch('/login', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password: passwordInput }),
  })
    .then((response) => {
      if (!response.ok) {
        $('#login-error').text(response.statusText);
        throw Error(response.statusText);
      }

      return response;
    })
    .then((response) => response.json())
    .then((r) => {
      $('#password-form').hide();
      getStudioData(r.token);
    })
    .catch((err) => console.log(err));
}

checkStudioFlow();
