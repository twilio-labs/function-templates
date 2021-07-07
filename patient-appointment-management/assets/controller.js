/* eslint-disable camelcase, object-shorthand, prefer-destructuring */

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
  fetch('/deployment/check-studio-flow', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })
    .then((response) => response.text())
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
  fetch('/deployment/check', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: token }),
  })
    .then((response) => response.text())
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
      $('#auth-successful').show();
      check();
    })
    .catch((err) => console.log(err));
}

// --------------------------------------------------------------------------------
$('#password-form').show();
$('#auth-successful').hide();
