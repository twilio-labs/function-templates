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
  .then((response) => {
      if (!response.ok) {
        throw 'An error occured when attempting to retrieve template configuration. To debug, check out the network response to the /return-config API endpoint.';
      }
      return response.json();
    })
  .then((json) => {
    phoneNumber = json.phone_number;
    // Grab the phone number being used and display it to help the user test their app
    const phoneNumberElements = $('.phone-number');
    phoneNumberElements.html(phoneNumber);
  })
  .catch((err) => {
    console.error(err);
    alert(err);
  });

function checkStudioFlow() {
  fetch('/check-existing-flow')
    .then((response) => {
      if (!response.ok) {
        throw 'An error occured when attempting to check the Studio Flow. To debug, check out the network response to the /check-existing-flow API endpoint.';
      }
      return response.text();
    })
    .then((sid) => {
      $('#deploy-flow .button').removeClass('loading');
      $('#flow-loader-container').hide();
      if (sid === 'none') {
        $('#deploy-flow').show();
      } else {
        flowSid = sid;
        $('#flow-deployed').show();
        $('#deploy-flow').hide();
        $('#open-studio').attr('href', `https://www.twilio.com/console/studio/flows/${sid}`);
      }
    })
    .catch((err) => {
      console.error(err);
      $('#flow-loader-container').hide();
      $('#deploy-flow').html(`<p style="color:red;">${err}</p>`)
      $('#deploy-flow').show();
    });
}

function checkAutopilot() {
  fetch('/check-existing-bot')
    .then((response) => {
      if (!response.ok) {
        throw 'An error occured when attempting to check the Autopilot Assistant. To debug, check out the network response to the /check-existing-bot API endpoint.';
      }
      return response.text();
    })
    .then((sid) => {
      $('#deploy-bot .button').removeClass('loading');
      $('#bot-loader-container').hide();
      if (sid === 'none') {
        $('#deploy-bot').show();
      } else {
        autopilotSid = sid;
        $('#bot-deployed').show();
        $('#deploy-bot').hide();
        $('#open-bot').attr('href', `https://www.twilio.com/console/autopilot/${sid}`);
      }
    })
    .catch((err) => {
      console.error(err);
      $('#bot-loader-container').hide();
      $('#deploy-bot').html(`<p style="color:red;">${err}</p>`)
      $('#deploy-bot').show();
    });
}


// eslint-disable-next-line no-unused-vars
function setupFlow(e) {
  e.preventDefault();
  $('#deploy-flow .button').addClass('loading');
  $('#flow-loader').show();

  fetch('/setup-flow').then(() => {
    checkStudioFlow();
  })
  .catch((err) => {
    console.log('An error ocurred creating Studio Flow', err);
    $('#deploy-flow .button').removeClass('loading');
    $('.loader.button-loader').hide();
  });
}

function addTask(task) {

  fetch('/add-task', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(task)
  })
  .then((res) => res)
  .catch((err) => {
    console.log('An error ocurred creating Assistant', err);
    $('#deploy-bot .button').removeClass('loading');
    $('.loader.button-loader').hide();
  });
}



function addTasks(sid) {
  return fetch('/get-autopilot')
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      const tasks = data["tasks"];
      const promises = [];

      for (let i = 0; i < tasks.length; i++) {
        const taskObj = {
          sid: sid,
          task: tasks[i]
        }
        promises.push(addTask(taskObj));
      }
      return Promise.all(promises);
    })
    .catch((err) => {
      console.log('An error ocurred creating Assistant', err);
      $('#deploy-bot .button').removeClass('loading');
      $('.loader.button-loader').hide();
    });
}

function buildModel() {
  return fetch('/build-autopilot-bot').then((response) => {
    if (!response.ok) {
      throw 'An error occured when attempting to build the Autopilot model.';
    }
    return response.text();
  })
}

function deployAutopilot() {
  return fetch('/setup-autopilot').then((res) => {
    if (!res.ok) {
      throw 'An error occured when attempting to create the Autopilot bot.';
    }
    return res.text();
  })
}

async function setupAutopilot(e) {
  e.preventDefault();
  $('#deploy-bot .button').addClass('loading');
  $('#bot-loader').show();
  try {
    const botSid = await deployAutopilot();
    await addTasks(botSid);
    await buildModel();
    checkAutopilot();
  } catch(err) {
    console.log('An error ocurred creating Assistant', err);
    $('#deploy-bot .button').removeClass('loading');
    $('.loader.button-loader').hide();
  }
}

checkStudioFlow();
checkAutopilot();
