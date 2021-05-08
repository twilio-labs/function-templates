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

function sendSMS() {
  let inputValue = document.getElementById('phone-number').value;
  fetch(`/send-sms?to=${inputValue}&from=14155344095`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('sms-confirmation').style.display = 'block';
    });
}

function getText() {
  fetch('/text')
    .then(response => response.json())
    .then(data => {
      console.log(data);
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
      document.getElementById('subtitle').innerHTML=data.subtitle; 
      document.getElementById('description').innerHTML=data.description; 
      document.getElementById('messagesPerMonth').innerHTML=data.messagesPerMonth;
      document.getElementById('buttonCta').innerHTML=data.buttonCta;

      document.getElementById('privacy-policy-link').href = data.privacyPolicyLink;
      document.getElementById('tos-link').href = data.tosLink;

      el.parentNode.removeChild( el );
      main.style.display = 'block';
    });
}

getText();