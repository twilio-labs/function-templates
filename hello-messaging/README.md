# SMS Auto-Response

Automatically respond to incoming text messages with "Hello World"

![SMS Auto-Response Demo](./assets/demo.png)

## Pre-requisites

- A Twilio account - [sign up here](https://www.twilio.com/try-twilio)
- A Twilio phone number

## How to Use

1. **Deploy with one click:**
   
   Use [Quick Deploy](https://www.twilio.com/code-exchange/basic-sms-auto-response) to instantly set up this template in your Twilio account.

2. **Test it:**
   
   Send any text to your Twilio number that you selected during setup and you'll get "Hello World" back!c

### Manual Deployment (Optional)

If you prefer to deploy manually, you'll need the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart) installed and configured with your account. You can clone this this template to your local environment and deploy to Twilio with the following commands:

```bash
twilio serverless:init my-responder --template=hello-messaging
cd my-responder
twilio serverless:deploy
```

Then, configure your phone number at [Twilio Phone Numbers](https://www.twilio.com/console/phone-numbers/incoming). Under "Messaging Configuration" → "A message comes in", you can either select "Function" and choose the hello-messaging service, or select "Webhook" and enter your Function URL (e.g., `https://your-service.twil.io/hello-messaging`).


## Customization

Edit `functions/hello-messaging.protected.js` to customize your auto-response:

**Business hours response:**
```javascript
twiml.message('Thanks for contacting us! Business hours: Mon-Fri 9am-6pm EST. We'll respond within 24 hours.');
```

**Route by keyword:**
```javascript
const message = event.Body.toLowerCase();

if (message.includes('support')) {
  twiml.message('For support: support@yourcompany.com or visit https://support.yourcompany.com');
} else if (message.includes('sales')) {
  twiml.message('Schedule a demo: https://calendly.com/yourcompany/demo');
} else {
  twiml.message('Reply with SUPPORT or SALES for assistance.');
}
```


## Learn More

- [TwiML for Messaging](https://www.twilio.com/docs/sms/twiml)
- [Twilio Functions](https://www.twilio.com/docs/runtime/functions)
