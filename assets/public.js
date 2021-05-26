function getMobileOperatingSystem() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "Desktop";
}

function settingsUpdate(input) {
  console.log(input.id, input.value);
  switch (input.id) {
    case 'logo-url':
      document.getElementById('logo').src = input.value;
      break;

    case 'campaign-title':
      document.getElementById('title').innerHTML = input.value;
      break;
    
    case 'campaign-description':
      document.getElementById('description').innerHTML = input.value;
      break;

    case 'background-color':
      document.getElementById('body').style.background = input.value;
      break;
    
    case 'font-color':
      document.getElementById('card-container').style.color = input.value;
      break;

    case 'message-quantity':
      document.getElementById('messageQuantity').innerHTML = input.value;
      break;

    case 'interval-select':
      document.getElementById('messageInterval').innerHTML = input.value;
      break;

    case 'button-cta':
      document.getElementById('buttonCta').innerHTML = input.value;
      break;
    
    case 'privacy-policy-link':
      document.getElementById('privacyPolicyLink').href = input.value;
      break;
  
    default:
      break;
  }
}

function sendSMS() {
  let inputValue = document.getElementById('phone-number').value;
  fetch(`/send-sms?to=${inputValue}&from=14155344095`)
    .then(data => {
      document.getElementById('sms-confirmation').style.display = 'block';
    });
}

function displaySettings(data) {
  if (window.location.href.indexOf('context=iframe') < 1) {
    document.getElementById('card-container').classList.remove('offset-md-4');
    document.getElementById('card-container').classList.toggle('offset-md-2');
    document.getElementById('settings').style.display = 'block';

    document.getElementById('logo-url').value = data.logoUrl;
    document.getElementById('campaign-title').value = data.title;
    document.getElementById('campaign-description').value = data.campaignDescription;
    document.getElementById('message-quantity').value = data.messageQuantity;
    document.getElementById('interval-select').value = data.messageInterval;
    document.getElementById('button-cta').value = data.buttonCta;
    document.getElementById('opt-in-keyword').value = data.optInKeyword;
    document.getElementById('contact-information').value = data.contactInformation;
    document.getElementById('privacy-policy-link').value = data.privacyPolicyLink;

    let iframeTemplate = `<code>
    &lt;iframe style="border:0" height="500px" width="100%" src="${data.domainName}/index.html?context=iframe"&gt;&lt;/iframe&gt;
    </code>`

    document.getElementById('iframe-panel').innerHTML = iframeTemplate;
  }
}

function setHomeConfig(data) {
  displaySettings(data);

  const el = document.querySelector( '#loading' );
  const main = document.getElementById("main");
  
  let deviceType = getMobileOperatingSystem();
  if (deviceType === 'Windows Phone' || deviceType === 'Android') {
    document.getElementById('cta-button').innerHTML = `<a id="buttonCta" class="btn btn-primary" href="sms:+14155344095?body=${data.optInKeyword}">Join Us</a>`
  } else if (deviceType === 'iOS') {
    document.getElementById('cta-button').innerHTML = `<a id="buttonCta" class="btn btn-primary" href="sms:+14155344095&body=${data.optInKeyword}">Join Us</a>`
  } else if (deviceType === 'Desktop') {
    document.getElementById('cta-button').innerHTML = `
    <div class="input-group mb-3">
      <input id="phone-number" type="text" class="form-control" placeholder="Your phone number" aria-label="Recipient's username" aria-describedby="button-addon2">
      <button class="btn btn-outline-primary" type="button" id="buttonCta" onClick="sendSMS()"></button>
    </div>
    `
  }

  document.getElementById('logo').src = data.logoUrl;
  document.getElementById('title').innerHTML=data.title;
  document.getElementById('description').innerHTML=data.campaignDescription; 
  document.getElementById('messageQuantity').innerHTML=data.messageQuantity;
  document.getElementById('messageInterval').innerHTML=data.messageInterval;
  document.getElementById('buttonCta').innerHTML=data.buttonCta;
  document.getElementById('privacyPolicyLink').href = data.privacyPolicyLink;

  el.parentNode.removeChild( el );
  main.style.display = 'block';
}

function updateTos(data) {
  //document.getElementById('logo').src = data.logoUrl;
  document.getElementById('title').innerHTML=data.title;
  document.getElementById('description').innerHTML=data.campaignDescription;
  document.getElementById('contact-information').innerHTML = data.contactInformation;
  document.getElementById('messageQuantity').innerHTML=data.messageQuantity;
  document.getElementById('privacy-policy-link').href = data.privacyPolicyLink;

}

function getText() {
  fetch('/get-settings')
    .then(response => response.json())
    .then(data => {
      if (window.location.href.indexOf('index.html') > 0) {
        setHomeConfig(data);
      } else {
        updateTos(data);
      }
    });
}

getText();