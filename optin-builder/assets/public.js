const descriptionId = '#description';
const cardContainerId = '#card-container';
const messageFrequencySpanId = '#messageFrequency';
const messageFrequencyInputId = '#message-frequency';
const webhookTabId = '#webhook-tab';
const ctaButtonId = '#cta-button';

function getMobileOperatingSystem() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/windows phone/i.test(userAgent)) {
    return 'Windows Phone';
  }

  if (/android/i.test(userAgent)) {
    return 'Android';
  }

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'iOS';
  }

  return 'Desktop';
}

function appendCustomCss(cssUrl) {
  if (cssUrl !== undefined) {
    // eslint-disable-next-line prefer-const
    let link = document.createElement('link');
    link.href = cssUrl;
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.media = 'screen,print';

    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

function settingsUpdate(input) {
  console.log(input.id, input.value);
  switch (input.id) {
    case 'logo-url':
      $('#logo').attr('src', input.value);
      break;

    case 'campaign-title':
      $('#title').html(input.value);
      break;

    case 'campaign-description':
      $(descriptionId).html(input.value);
      break;

    case 'background-color':
      $('#body').css('background', input.value);
      break;

    case 'font-color':
      $(cardContainerId).css('color', input.value);
      break;

    case 'message-frequency':
      $(messageFrequencySpanId).html(input.value);
      break;

    case 'message-quantity':
      console.log('quantity changed');
      const interval = $('#message-interval').val();
      const quantityUpdate = `${input.value} message${
        input.value > 1 ? 's' : ''
      } per ${interval}`;
      $(messageFrequencyInputId).val(quantityUpdate);
      $(messageFrequencySpanId).html(quantityUpdate);
      break;

    case 'message-interval':
      const quantity = $('#message-quantity').val();
      const intervalUpdate = `${quantity} message${
        quantity > 1 ? 's' : ''
      } per ${input.value}`;
      $(messageFrequencyInputId).val(intervalUpdate);
      $(messageFrequencySpanId).html(intervalUpdate);
      break;

    case 'button-cta':
      $('#buttonCta').html(input.value);
      break;

    case 'privacy-policy-link':
      $('#privacyPolicyLink').attr('href', input.value);
      break;

    case 'data-source':
      $('#data-source').val(input.value);
      break;

    default:
      break;
  }
}

function setOpenDataPanel(dataSource) {
  switch (dataSource) {
    case 'webhook':
      $(webhookTabId).tab('show');
      break;

    case 'segment':
      $('#segment-tab').tab('show');
      break;

    case 'airtable':
      $('#airtable-tab').tab('show');
      break;

    default:
      $(webhookTabId).tab('show');
      break;
  }
}

function bindMessageFrequencyTabs() {
  $('#frequency-varies-tab').on('click', function (e) {
    $(messageFrequencyInputId).val('Message frequency varies');
    $(messageFrequencySpanId).html('Message frequency varies');
  });
}

function bindDataSourceTabs() {
  const dataSourceId = 'data-source';
  $(webhookTabId).on('click', function (e) {
    const dataSource = e.target.innerText.toLocaleLowerCase();
    settingsUpdate({ id: dataSourceId, value: dataSource });
  });

  $('#segment-tab').on('click', function (e) {
    const dataSource = e.target.innerText.toLocaleLowerCase();
    settingsUpdate({ id: dataSourceId, value: dataSource });
  });

  $('#airtable-tab').on('click', function (e) {
    const dataSource = e.target.innerText.toLocaleLowerCase();
    settingsUpdate({ id: dataSourceId, value: dataSource });
  });
}

function sendSMS() {
  const inputValue = $('#phone-number').val();
  fetch(`/send-sms?to=${inputValue}`).then(() => {
    $('#sms-confirmation').css('display', 'block');
  });
}

// Displays settings and prefills setting values from stored settings.
function displaySettings(data) {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('error')) {
    $('#danger-alert').css('display', 'block');
    $('#danger-alert').html(urlParams.get('error'));
  }

  if (urlParams.has('success')) {
    $('#success-alert').css('display', 'block');
    $('#success-alert').html(urlParams.get('success'));
  }

  if (window.location.href.indexOf('context=iframe') < 1) {
    $(cardContainerId).removeClass('offset-md-4');
    $(cardContainerId).toggleClass('offset-md-2');
    $('#settings').css('display', 'block');

    $('#logo-url').val(data.logoUrl);
    $('#campaign-title').val(data.campaignTitle);
    $('#campaign-description').val(data.campaignDescription);
    $('#button-cta').val(data.buttonCta);

    $('#background-color').val(data.backgroundColor);
    $('#font-color').val(data.fontColor);
    $('#custom-css').val(data.customCss);

    $(messageFrequencyInputId).val(data.messageFrequency);
    $('#opt-in-keyword').val(data.optInKeyword);
    $('#contact-information').val(data.contactInformation);
    $('#privacy-policy-link').val(data.privacyPolicyLink);

    setOpenDataPanel(data.dataSource);

    $('#webhook-url').val(data.webhookUrl);

    $('#segment-write-key').attr('placeholder', data.segmentWriteKey);

    $('#airtable-api-key').attr('placeholder', data.airtableApiKey);
    $('#airtable-base-id').attr('placeholder', data.airtableBaseId);
    $('#airtable-table-name').val(data.airtableTableName);
    $('#airtable-phone-column-name').val(data.airtablePhoneColumnName);
    $('#airtable-opt-in-column-name').val(data.airtableOptInColumnName);

    const iframeTemplate = `<code>
    &lt;iframe style="border:0" height="500px" width="100%" src="https://${data.domainName}/index.html?context=iframe"&gt;&lt;/iframe&gt;
    </code>`;

    $('#iframe-panel').html(iframeTemplate);

    bindMessageFrequencyTabs();
    bindDataSourceTabs();
  }
}

function setComplianceWarning(data) {
  if (data.hasOwnProperty('complianceWarning')) {
    data.complianceWarning.map((missingField) => {
      let formattedField = missingField.split(/(?=[A-Z])/).join(' ');
      formattedField =
        formattedField[0].toUpperCase() + formattedField.slice(1);
      return $('#missing-fields').append(`<li>${formattedField}</li>`);
    });

    $('#compliance-warning').show();
  }
}

// Customizes the opt-in form on page load.
function setHomeConfig(data) {
  displaySettings(data);
  setComplianceWarning(data);

  const el = document.querySelector('#loading');
  const main = $('#main');

  const deviceType = getMobileOperatingSystem();
  if (deviceType === 'Windows Phone' || deviceType === 'Android') {
    $(ctaButtonId).html(
      `<a id="buttonCta" class="btn btn-primary" href="sms:+14155344095?body=${data.optInKeyword}">Join Us</a>`
    );
  } else if (deviceType === 'iOS') {
    $(ctaButtonId).html(
      `<a id="buttonCta" class="btn btn-primary" href="sms:+14155344095&body=${data.optInKeyword}">Join Us</a>`
    );
  } else if (deviceType === 'Desktop') {
    $(ctaButtonId).html(`
    <div class="input-group mb-3">
      <input id="phone-number" type="text" class="form-control" placeholder="Your phone number" aria-label="Recipient's username" aria-describedby="button-addon2">
      <button class="btn btn-outline-primary" type="button" id="buttonCta" onClick="sendSMS()"></button>
    </div>
    `);
  }

  $('#logo').attr('src', data.logoUrl);
  $('#title').html(data.campaignTitle);
  $(descriptionId).html(data.campaignDescription);
  $('#buttonCta').html(data.buttonCta);

  $('#body').css('background', data.backgroundColor);
  $(cardContainerId).css('color', data.fontColor);
  appendCustomCss(data.customCss);
  console.log(data.messageFrequency);
  $(messageFrequencySpanId).html(data.messageFrequency);
  $('#privacyPolicyLink').attr('href', data.privacyPolicyLink);

  el.parentNode.removeChild(el);
  main.css('display', 'block');
}

function updateTos(data) {
  $('#title').html(data.campaignTitle);
  $(descriptionId).html(data.campaignDescription);
  $('#contact-information').html(data.contactInformation);
  $(messageFrequencySpanId).html(data.messageFrequency);
  $('#privacy-policy-link').attr('href', data.privacyPolicyLink);
}

function getText() {
  fetch('/get-settings')
    .then((response) => response.json())
    .then((data) => {
      if (window.location.href.indexOf('index.html') > 0) {
        setHomeConfig(data);
      } else {
        updateTos(data);
      }
    });
}

getText();
