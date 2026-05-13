# SMS Auto-Response - Agent Guidelines

## Project Overview

Simple SMS auto-response system: when a user texts the Twilio phone number, it responds with "Hello World". Built with Twilio Functions and TwiML. No environment variables required. This is a beginner-friendly template for learning Twilio Messaging.

## Documentation Links

All Twilio documentation URLs in this guide can be accessed in markdown format by adding `.md` to the end of the URL.

## Do-Not-Touch Areas

### 1. Function Entry Point

The handler function signature must remain unchanged:
```javascript
exports.handler = function (context, event, callback) {
  // ...
}
```

The three parameters (context, event, callback) are provided by Twilio Functions runtime and should not be modified.

### 2. TwiML Response Structure

The template uses `Twilio.twiml.MessagingResponse()` to generate proper TwiML. Do not replace this with manual XML string construction:

```javascript
// CORRECT:
const twiml = new Twilio.twiml.MessagingResponse();
twiml.message('Hello World');
callback(null, twiml);

// INCORRECT (don't do this):
callback(null, '<Response><Message>Hello World</Message></Response>');
```

### 3. Webhook Configuration

The function must be configured as a webhook for incoming SMS messages. The webhook URL format is:
```
https://[your-domain].twil.io/hello-messaging
```

This is configured in the Twilio Console under Phone Numbers → Messaging Configuration.

## Coding Conventions

### TwiML Responses

Always use Twilio's TwiML helper classes for generating responses:

```javascript
const twiml = new Twilio.twiml.MessagingResponse();
twiml.message('Your message here');
callback(null, twiml);
```

### Error Handling

For error cases, pass the error as the first parameter to callback:

```javascript
if (error) {
  callback(error);
  return;
}
```

### Styling

The template includes an HTML landing page (`assets/index.html`) that uses Twilio Paste theme CSS (`ce-paste-theme.css`) for consistent styling.

## Tests

Run `npm test` from the repository root. Tests verify:
- The function returns valid TwiML
- The response contains the "Hello World" message
- The TwiML structure is correct

## Common Tasks

### Changing the Response Message

To change what the auto-response says:

```javascript
// In functions/hello-messaging.protected.js
twiml.message('Your custom message here');
```

### Adding Dynamic Responses

Use information from the `event` object to personalize responses:

```javascript
const fromNumber = event.From;
const messageBody = event.Body;

twiml.message(`Thanks for texting! You said: ${messageBody}`);
```

### Adding Media to Responses

Send images or other media with the response:

```javascript
const message = twiml.message('Check out this image!');
message.media('https://example.com/image.jpg');
```

### Responding to Specific Keywords

Add conditional logic based on the incoming message:

```javascript
const incomingMessage = event.Body.toLowerCase();

if (incomingMessage.includes('help')) {
  twiml.message('Here is how I can help you...');
} else if (incomingMessage.includes('hours')) {
  twiml.message('We are open 9am-5pm Monday-Friday');
} else {
  twiml.message('Hello World');
}
```

### Using Environment Variables

While this template doesn't require environment variables, you can add them for configuration:

```javascript
// Access environment variables via context
const customMessage = context.CUSTOM_MESSAGE || 'Hello World';
twiml.message(customMessage);
```

Then set the variable in your `.env` file or Twilio Console.

## Further Resources

- [TwiML for Programmable Messaging](https://www.twilio.com/docs/sms/twiml)
- [Twilio Functions Quickstart](https://www.twilio.com/docs/runtime/quickstart)
- [Messaging Request Parameters](https://www.twilio.com/docs/sms/twiml#request-parameters)
- [Phone Numbers Console](https://www.twilio.com/console/phone-numbers/incoming)
