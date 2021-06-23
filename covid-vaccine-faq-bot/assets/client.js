/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable prefer-destructuring */
let phoneNumber;
let flowSid;

// eslint-disable-next-line no-restricted-globals
const baseUrl = new URL(location.href);
baseUrl.pathname = baseUrl.pathname.replace(/\/index\.html$/, '');
delete baseUrl.hash;
delete baseUrl.search;
const fullUrl = baseUrl.href.substr(0, baseUrl.href.length - 1);

fetch(`${fullUrl}/return-config`)
  .then((response) => response.json())
  .then((json) => {
    phoneNumber = json.phoneNumber;
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
        $('#open-studio').attr(
          'href',
          `https://www.twilio.com/console/studio/flows/${sid}`
        );
        $('.execution-logs-link').attr(
          'href',
          `https://www.twilio.com/console/studio/flows/${sid}/executions`
        );
      }
    })
    .catch((err) => {
      console.log(
        'An error occurred when attempting to check the Studio Flow',
        err
      );
    });
}

// eslint-disable-next-line no-unused-vars
function setup(e) {
  e.preventDefault();
  $('#deploy-flow .button').addClass('loading');
  $('.loader.button-loader').show();

  fetch('/setup')
    .then(() => {
      checkStudioFlow();
    })
    .catch((err) => {
      console.log('An error ocurred creating Studio Flow', err);
      $('#deploy-flow .button').removeClass('loading');
      $('.loader.button-loader').hide();
    });
}

checkStudioFlow();
