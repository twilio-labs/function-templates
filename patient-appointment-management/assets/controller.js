/* eslint-disable camelcase */

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
function checkQueryHistory(resource) {
  fetch('/deployment/check-query?table=history')
    .then((response) => response.text())
    .then((url) => {
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
      console.log(
        'An error occurred when attempting to check the AWS Resources',
        err
      );
    });
}

// --------------------------------------------------------------------------------
function checkQueryState(resource) {
  fetch('/deployment/check-query?table=state')
    .then((response) => response.text())
    .then((url) => {
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

        checkQueryHistory();
      }
    })
    .catch((err) => {
      console.log(
        'An error occurred when attempting to check the AWS Resources',
        err
      );
    });
}

// --------------------------------------------------------------------------------
function checkAWSApplication(resource) {
  fetch('/deployment/check-aws-application')
    .then((response) => response.text())
    .then((status) => {
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

        $('#ready-to-use').show();
        checkQueryState();
      } else {
        throw new Error();
      }
    })
    .catch((err) => {
      console.log(
        'An error occurred when attempting to check the AWS Resources',
        err
      );
    });
}

// --------------------------------------------------------------------------------
function checkAWSBucket(resource) {
  fetch('/deployment/check-aws-bucket')
    .then((response) => response.text())
    .then((status) => {
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
      console.log(
        'An error occurred when attempting to check the AWS Resources',
        err
      );
    });
}

// --------------------------------------------------------------------------------
function deployAWSBucket(e) {
  e.preventDefault();
  $('#aws-bucket-deploy .button').addClass('loading');
  $('.aws-bucket-loader.button-loader').show();

  fetch('/deployment/deploy-aws-bucket')
    .then(() => {
      checkAWSBucket();
    })
    .catch((err) => {
      console.log('An error ocurred deploying AWS Bucket', err);
      $('#aws-bucket-deploy .button').removeClass('loading');
      $('.aws-bucket-loader.button-loader').hide();
    });
}

// --------------------------------------------------------------------------------
function deployAWSApplication(e) {
  e.preventDefault();
  $('#aws-application-deploy .button').addClass('loading');
  $('.aws-application-loader.button-loader').show();

  fetch('/deployment/deploy-aws-code').then(() => {
    console.log('deployed aws code');
  });

  fetch('/deployment/deploy-aws-application')
    .then(() => {
      checkAWSApplication();
    })
    .catch((err) => {
      console.log('An error ocurred creating AWS Application', err);
      $('#aws-application-deploy .button').removeClass('loading');
      $('.aws-application-loader.button-loader').hide();
    });
}

// --------------------------------------------------------------------------------
function checkStudioFlow() {
  fetch('/deployment/check-studio-flow')
    .then((response) => response.text())
    .then((sid) => {
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
      console.log(
        'An error occurred when attempting to check the Studio Flow',
        err
      );
    });
}

// --------------------------------------------------------------------------------
function deployStudioFlow(e) {
  e.preventDefault();
  $('#flow-deploy .button').addClass('loading');
  $('.flow-loader.button-loader').show();

  fetch('/deployment/deploy-studio-flow')
    .then(() => {
      checkStudioFlow();
    })
    .catch((err) => {
      console.log('An error ocurred creating Studio Flow', err);
      $('#flow-deploy .button').removeClass('loading');
      $('.flow-loader.button-loader').hide();
    });
}

function getStudioExecutions(sid, token) {
  const tbody = $('#residents-table-body');
  fetch(`/get-studio-executions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        updateTable(data);
      } else {
        tbody.html(
          `<tr class="table-placeholder"><td colspan="11">No records yet. Send a text message to <strong class="phone-number">${phoneNumber}</strong> to begin.</td></tr>`
        );
      }
    })
    .catch((err) => {
      console.log(err);
      tbody.html(
        `<tr class="table-placeholder"><td colspan="11" style="color: red">There was an error when attempting to fetch Studio Logs. Refresh the page to try again or see troubleshooting steps below.</td></tr>`
      );
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
      $('#password-form').hide();
      getStudioData(r.token);
    })
    .catch((err) => console.log(err));
}

checkStudioFlow();
