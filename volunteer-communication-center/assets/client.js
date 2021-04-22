/* eslint-disable no-console */
/* eslint-disable no-undef */
let phoneNumber;
let flowSid;
let autopilotSid;

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

function checkAutopilot() {
  fetch('/check-existing-bot')
    .then((response) => response.text())
    .then((sid) => {
      $('#deploy-bot .button').removeClass('loading');
      $('.loader').hide();
      if (sid === 'none') {
        $('#deploy-bot').show();
      } else {
        autopilotSid = sid;
        $('#bot-deployed').show();
        $('#deploy-bot').hide();
        $('.post-deploy-studio').show();
        $('#open-bot').attr('href', `https://www.twilio.com/console/autopilot/${sid}`);
      }
    })
    .catch((err) => {
      console.log('An error occurred when attempting to check the Autopilot Assistant', err);
    });
}


// eslint-disable-next-line no-unused-vars
function setupFlow(e) {
  e.preventDefault();
  $('#deploy-flow .button').addClass('loading');
  $('.loader.button-loader').show();

  fetch('/setup-flow').then(() => {
    checkStudioFlow();
  })
  .catch((err) => {
    console.log('An error ocurred creating Studio Flow', err);
    $('#deploy-flow .button').removeClass('loading');
    $('.loader.button-loader').hide();
  });
}

// eslint-disable-next-line no-unused-vars
function setupAutopilot(e) {
  
  e.preventDefault();
  $('#deploy-bot .button').addClass('loading');
  $('.loader.button-loader').show();

  fetch('/setup-autopilot').then(() => {
    checkAutopilot();
  })
  .catch((err) => {
    console.log('An error ocurred creating Assistant', err);
    $('#deploy-bot .button').removeClass('loading');
    $('.loader.button-loader').hide();
  });

}

checkStudioFlow();
checkAutopilot();
