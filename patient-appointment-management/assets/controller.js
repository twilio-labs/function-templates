/* eslint-disable camelcase, object-shorthand, prefer-destructuring, no-use-before-define, sonarjs/no-collapsible-if, vars-on-top, no-var, dot-notation, prefer-template */

/*
 * main controller javascript used by index.html
 *
 * The following functions are executed in sequence for proper deployment order.
 * Each check function will call the next check function when deployment is complete.
 * - checkStudioFlow
 * - checkAWSBucket
 * - checkAWSApplication
 * - readyToUse
 *
 */
let phoneNumber;
let flowSid;
let userActive = true;
const TOKEN_REFRESH_INTERVAL = 30 * 60 * 1000;

const baseUrl = new URL(location.href);
baseUrl.pathname = baseUrl.pathname.replace(/\/index\.html$/, '');
delete baseUrl.hash;
delete baseUrl.search;
const fullUrl = baseUrl.href.substr(0, baseUrl.href.length - 1);

/*
 *fetch(`${fullUrl}/return-config`)
 *  .then((response) => response.json())
 *  .then((json) => {
 *    phoneNumber = json.phone_number;
 *    // Grab the phone number being used and display it to help the user test their app
 *    const phoneNumberElements = $('.phone-number');
 *    phoneNumberElements.html(phoneNumber);
 *  });
 */

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

// --------------------------------------------------------------------------------
function checkHistory() {
  THIS = 'checkHistory:';
  userActive = true;
  console.log(THIS, 'running');
  fetch(`/deployment/check-query?table=history`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: token }),
  })
    .then((response) => response.text())
    .then((url) => {
      console.log(THIS, url);
      $('#history-download .button').removeClass('loading');
      $('.history-downloader').hide();
      if (url === 'READY') {
        $('#history-query').show();
      } else if (url === 'RUNNING') {
        $('#history-querying').show();
        $('#history-query').hide();
        setTimeout(checkHistory, 5000);
      } else if (url === 'FAILED') {
        throw new Error();
      } else {
        $('#history-ready').show();
        $('#history-querying').hide();
        $('#history-download').attr('href', `${url}`);
      }
    })
    .catch((err) => {
      console.log(THIS, err);
    });
}

// --------------------------------------------------------------------------------
function downloadHistory(e) {
  THIS = 'downloadHistory:';
  console.log(THIS, 'running');
  userActive = true;
  e.preventDefault();
  $('#history-download .button').addClass('loading');
  $('.history-downloader.button-loader').show();

  fetch('/deployment/execute-query?table=history', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })
    .then(() => {
      console.log(THIS, 'success');
      checkHistory();
    })
    .catch((err) => {
      console.log(THIS, err);
      $('#history-download .button').removeClass('loading');
      $('.history-downloader.button-loader').hide();
    });
}

// --------------------------------------------------------------------------------
function checkState() {
  THIS = 'checkState:';
  console.log(THIS, 'running');
  userActive = true;

  fetch(`/deployment/check-query?table=state`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: token }),
  })
    .then((response) => response.text())
    .then((url) => {
      console.log(THIS, url);
      $('#state-download .button').removeClass('loading');
      $('.state-downloader').hide();
      if (url === 'READY') {
        $('#state-query').show();
      } else if (url === 'RUNNING') {
        $('#state-querying').show();
        $('#state-query').hide();
        setTimeout(checkState, 5000);
      } else if (url === 'FAILED') {
        throw new Error();
      } else {
        $('#state-ready').show();
        $('#state-querying').hide();
        $('#state-download').attr('href', `${url}`);
      }
    })
    .catch((err) => {
      console.log(THIS, err);
    });
}

// --------------------------------------------------------------------------------
function downloadState(e) {
  THIS = 'downloadState:';
  console.log(THIS, 'running');
  userActive = true;

  e.preventDefault();
  $('#state-download .button').addClass('loading');
  $('.state-downloader.button-loader').show();

  fetch('/deployment/execute-query?table=state', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })
    .then(() => {
      console.log(THIS, 'success');
      checkState();
    })
    .catch((err) => {
      console.log(THIS, err);
      $('#state-download .button').removeClass('loading');
      $('.state-downloader.button-loader').hide();
    });
}

// --------------------------------------------------------------------------------
function readyToUse() {
  THIS = 'readyToUse:';
  console.log(THIS, 'running');
  $('#ready-to-use').show();

  checkState();
  checkHistory();
}

// --------------------------------------------------------------------------------
function checkAWSApplication() {
  THIS = 'checkAWSApplication:';
  console.log(THIS, 'running');
  userActive = true;
  fetch('/deployment/check-aws-application', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })
    .then((response) => response.text())
    .then((status) => {
      console.log(THIS, status);
      $('#aws-application-deploy .button').removeClass('loading');
      $('.aws-application-loader').hide();
      if (status === 'NOT-DEPLOYED') {
        $('#aws-application-deploy').show();
      } else if (status === 'DEPLOYING') {
        $('#aws-application-deploying').show();
        $('#aws-application-deploy').hide();
        setTimeout(checkAWSApplication, 5000);
      } else if (status === 'DEPLOYED') {
        $('#aws-application-deployed').show();
        $('#aws-application-deploying').hide();
        $('#aws-application-open').attr(
          'href',
          `https://console.aws.amazon.com/cloudformation/`
        );

        readyToUse();
      } else {
        throw new Error();
      }
    })
    .catch((err) => {
      console.log(THIS, err);
    });
}

// --------------------------------------------------------------------------------
function deployAWSApplication(e) {
  THIS = 'deployAWSApplication:';
  console.log(THIS, 'running');
  userActive = true;

  e.preventDefault();
  $('#aws-application-deploy .button').addClass('loading');
  $('.aws-application-loader.button-loader').show();

  fetch('/deployment/deploy-aws-code', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  }).then(() => {
    console.log(THIS, 'deployed aws code');
  });

  fetch('/deployment/deploy-aws-application', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })
    .then(() => {
      console.log(THIS, 'success');
      checkAWSApplication();
    })
    .catch((err) => {
      console.log(THIS, err);
      $('#aws-application-deploy .button').removeClass('loading');
      $('.aws-application-loader.button-loader').hide();
    });
}

// --------------------------------------------------------------------------------
function checkAWSBucket(resource) {
  THIS = 'checkAWSBucket:';
  console.log(THIS, 'running');
  userActive = true;

  fetch('/deployment/check-aws-bucket', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })
    .then((response) => response.text())
    .then((status) => {
      console.log(THIS, status);
      $('#aws-bucket-deploy .button').removeClass('loading');
      $('.aws-bucket-loader').hide();
      if (status === 'NOT-DEPLOYED') {
        $('#aws-bucket-deploy').show();
      } else if (status === 'DEPLOYING') {
        $('#aws-bucket-deploying').show();
        $('#aws-bucket-deploy').hide();
        setTimeout(checkAWSBucket, 5000);
      } else if (status === 'FAILED') {
        throw new Error();
      } else {
        $('#aws-bucket-deployed').show();
        $('#aws-bucket-deploying').hide();
        $('#aws-bucket-open').attr(
          'href',
          `https://console.aws.amazon.com/s3/buckets/${status}`
        );

        checkAWSApplication();
      }
    })
    .catch((err) => {
      console.log(THIS, err);
    });
}

// --------------------------------------------------------------------------------
function deployAWSBucket(e) {
  THIS = 'deployAWSBucket:';
  console.log(THIS, 'running');
  userActive = true;

  e.preventDefault();
  $('#aws-bucket-deploy .button').addClass('loading');
  $('.aws-bucket-loader.button-loader').show();

  fetch('/deployment/deploy-aws-bucket', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })
    .then(() => {
      console.log(THIS, 'success');
      checkAWSBucket();
    })
    .catch((err) => {
      console.log(THIS, err);
      $('#aws-bucket-deploy .button').removeClass('loading');
      $('.aws-bucket-loader.button-loader').hide();
    });
}

// --------------------------------------------------------------------------------
function checkStudioFlow() {
  THIS = 'checkStudioFlow:';
  console.log(THIS, 'running');
  userActive = true;

  fetch('/deployment/check-studio-flow', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 401) handleInvalidToken();
        throw Error(response.statusText);
      }
      return response.text();
    })
    .then((sid) => {
      console.log(THIS, sid);
      $('#flow-deploy .button').removeClass('loading');
      $('.flow-loader').hide();
      if (sid === 'NOT-DEPLOYED') {
        $('#flow-deploy').show();
      } else {
        flowSid = sid;
        $('#flow-deployed').show();
        $('#flow-deploy').hide();
        $('#flow-open').attr(
          'href',
          `https://www.twilio.com/console/studio/flows/${sid}`
        );
        $('#flow-rest-api-url').text(
          `https://studio.twilio.com/v2/Flows/${sid}/Executions`
        );
        checkAWSBucket();
      }
    })
    .catch((err) => {
      console.log(THIS, err);
    });
}

// --------------------------------------------------------------------------------
function deployStudioFlow(e) {
  THIS = 'deployStudioFlow:';
  console.log(THIS, 'running');
  userActive = true;

  e.preventDefault();
  $('#flow-deploy .button').addClass('loading');
  $('.flow-loader.button-loader').show();

  fetch('/deployment/deploy-studio-flow', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 401) handleInvalidToken();
        throw Error(response.statusText);
      }
      return response.text();
    })
    .then(() => {
      console.log(THIS, 'success');
      checkStudioFlow();
    })
    .catch((err) => {
      console.log(THIS, err);
      $('#flow-deploy .button').removeClass('loading');
      $('.flow-loader.button-loader').hide();
    });
}

// --------------------------------------------------------------------------------
function check() {
  THIS = 'check:';
  console.log(THIS, 'running');
  userActive = true;

  fetch('/deployment/check', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: token }),
  })
    .then((response) => {
      if (!response.ok) if (response.status === 401) handleInvalidToken();
      return response.text();
    })
    .then((text) => {
      errors = JSON.parse(text);
      if (errors.length === 0) {
        // no errors, so proceed
        $('#valid-environment-variable').show();
        checkStudioFlow();
      } else {
        $('#invalid-environment-variable').show();
        for (e of errors) {
          const error = $('<p></p>').text(JSON.stringify(e));
          $('#invalid-environment-variable').append(error);
        }
      }
    })
    .catch((err) => {
      console.log(THIS, err);
    });
}

// --------------------------------------------------------------------------------
async function login(e) {
  e.preventDefault();
  userActive = true;

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
        $('#login-error').text(
          response.status === 401
            ? 'Incorrect password, please try again.'
            : 'There was an error when attempting to log in.'
        );
        throw Error(response.statusText);
      }

      return response;
    })
    .then((response) => response.json())
    .then((r) => {
      token = r.token;
      $('#password-form').hide();
      $('#password-input').val('');
      var decodedToken = parseJwt(token);
      if (decodedToken['aud'] === 'app') {
        $('#auth-successful').show();
        scheduleTokenRefresh();
        check();
      } else {
        $('#mfa-form').show();
        $('#mfa-input').focus();
      }
    })
    .catch((err) => console.log(err));
}

// --------------------------------------------------------------------------------

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}

// -------------------------------------------------------------------------------
async function mfa(e) {
  e.preventDefault();
  userActive = true;

  const mfaInput = $('#mfa-input').val();
  fetch('/mfa', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mfaCode: mfaInput, token: token }),
  })
    .then((response) => {
      if (!response.ok) {
        $('#mfa-error').text(
          response.status === 401
            ? response.headers.get('Error-Message')
            : 'There was an error in verifying your security code.'
        );
        throw Error(response.statusText);
      }

      return response;
    })
    .then((response) => response.json())
    .then((r) => {
      token = r.token;

      $('#mfa-form').hide();
      $('#mfa-input').val('');
      $('#auth-successful').show();
      scheduleTokenRefresh();
      check();
    })
    .catch((err) => console.log(err));
}
function scheduleTokenRefresh() {
  setTimeout(refreshToken, TOKEN_REFRESH_INTERVAL);
}
// -----------------------------------------------------------------------------
async function refreshToken() {
  if (!userActive) return;
  userActive = false;

  fetch('/refresh-token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: token }),
  })
    .then((response) => {
      return response;
    })
    .then((response) => response.json())
    .then((r) => {
      scheduleTokenRefresh();
      token = r.token;
    })
    .catch((err) => console.log(err));

  // -----------------------------------------------------------------------------
  async function getSimulationParameters() {
    THIS = 'getSimulationParameters:';
    console.log(THIS, 'running');
    userActive = true;

    fetch('/deployment/simulate-parameters', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
      .then((response) => response.json())
      .then((r) => {
        let date = new Date(r['appointmentTimestamp']);
        var ds = date.toDateString() + ' ' + date.toLocaleTimeString();

        $('#name-sent-from').val(r['customerName']);
        $('#number-sent-from').val(r['customerPhoneNumber']);
        $('#date-time').val(ds);
        $('#provider').val(r['provider']);
        $('#location').val(r['location']);
        // Aug 23, 2021 at 4:30 PM
        console.log('Sim params:', r);
      })
      .catch((err) => {
        console.log(THIS, err);
      });
  }
}
// --------------------------------------------------------------------------------

function handleInvalidToken() {
  $('#password-form').show();
  $('#auth-successful').hide();
  $('#mfa-form').hide();
  $('#invalid-environment-variable').hide();
  $('#valid-environment-variable').hide();
  $('#flow-loader').hide();
  $('#flow-deploy').hide();
  $('#flow-deployed').hide();
  $('#aws-bucket-deploy').hide();
  $('#aws-bucket-deploying').hide();
  $('#aws-bucket-deployed').hide();
  $('#aws-application-deploy').hide();
  $('#aws-application-deploying').hide();
  $('#aws-application-deployed').hide();

  $('#password-input').focus();
}
// --------------------------------------------------------------------------------

function goHome() {
  $('main').show();
  $('simulate').hide();
  $('.menu-main').hide();
  $('.menu-simulate').show();
}
// --------------------------------------------------------------------------------

function goSimulate() {
  try {
    decodedToken = parseJwt(token);
    console.log(decodedToken['exp'] * 1000);
    console.log(Date.now());
    //switch to simulate page only if token is NOT expired or if it is app token
    if (
      Date.now() <= decodedToken['exp'] * 1000 &&
      decodedToken['aud'] === 'app'
    ) {
      $('main').hide();
      $('simulate').show();
      $('.menu-main').show();
      $('.menu-simulate').hide();
      getSimulationParameters();
    } else throw Error();
  } catch (e) {
    $('.simulate-error').fadeIn();
    setTimeout(function () {
      $('.simulate-error').fadeOut();
    }, 5000);
  }
}

// --------------------------------------------------------------------------------
$('#auth-successful').hide();
$('#mfa-form').hide();
$('.menu-main').hide();
$('simulate').hide();
$('#password-form').show();
$('#password-input').focus();
