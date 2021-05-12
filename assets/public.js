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

    case 'message-quantity':
      document.getElementById('messageQuantity').innerHTML = input.value;
      break;

    case 'interval-select':
      document.getElementById('messageInterval').innerHTML = input.value;
      break;
  
    default:
      break;
  }
}

function sendSMS() {
  let inputValue = document.getElementById('phone-number').value;
  fetch(`/send-sms?to=${inputValue}&from=14155344095`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('sms-confirmation').style.display = 'block';
    });
}

function displaySettings() {
  if (window.location.href.indexOf('context=iframe') < 1) {
    document.getElementById('card-container').classList.remove('offset-md-4');
    document.getElementById('card-container').classList.toggle('offset-md-2');
    document.getElementById('settings').style.display = 'block';
  }
}

function setHomeConfig(data) {
  displaySettings();

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
  document.getElementById('description').innerHTML=data.description; 
  document.getElementById('messageQuantity').innerHTML=data.messageQuantity;
  document.getElementById('messageInterval').innerHTML=data.messageInterval;
  document.getElementById('buttonCta').innerHTML=data.buttonCta;

  document.getElementById('privacy-policy-link').href = data.privacyPolicyLink;

  el.parentNode.removeChild( el );
  main.style.display = 'block';
}

function updateTos(data) {
  //document.getElementById('logo').src = data.logoUrl;
  document.getElementById('title').innerHTML=data.title;
  document.getElementById('description').innerHTML=data.description; 
  document.getElementById('messageQuantity').innerHTML=data.messageQuantity;
  document.getElementById('privacy-policy-link').href = data.privacyPolicyLink;

}

function getText() {
  fetch('/get-config')
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