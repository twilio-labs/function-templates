# Voice IVR - Agent Guidelines

This document provides AI assistants with essential information for working with the Voice IVR project.

## Project Overview

The Voice IVR project implements an interactive voice response system using Twilio. The system allows callers to navigate a phone tree using keypad digits or speech recognition. When users call the Twilio number, they can choose between: talking to sales, hearing business hours, or receiving an SMS with the company address.

## Documentation Links

All Twilio documentation URLs in this guide can be accessed in markdown format by adding `.md` to the end of the URL.

## Do-Not-Touch Areas

### 1. Webhook Signature Verification

The `.protected.js` suffix on function files indicates they require valid Twilio signatures. Never remove this protection or modify the validation logic. Twilio's serverless toolkit handles this automatically.

### 2. Critical Parameters

Never modify these critical parameters without explicit instructions:

- `numDigits: 1` in voice-ivr.js - This ensures the system expects a single digit input
- `input: 'speech dtmf'` in voice-ivr.js - This enables both speech and touch-tone input
- Webhook paths (`voice-ivr` and `handle-user-input`) - These must match Twilio configurations

### 3. Sensitive Data

Never expose or hardcode these sensitive details:

- Phone numbers (use environment variables)
- Twilio account credentials
- Customer information received during calls

## Coding Conventions

**TwiML must be returned via callback**: All functions must call `callback(null, twiml)` to return TwiML responses. Never use `return twiml` directly.

```javascript
const twiml = new Twilio.twiml.VoiceResponse();
twiml.say('Message to speak');
callback(null, twiml); // Required pattern
```

## Tests

Run `npm test` from the repository root. Comprehensive test coverage exists in `tests/` for both functions, covering DTMF inputs, speech recognition, error handling, and SMS delivery.

## Common Tasks

### Adding a New Menu Option

To add a new menu option (e.g., "Support"):

1. Add new option in `voice-ivr.protected.js`:
   ```javascript
   gather.say('Press 4 or say Support to get technical help');
   ```

2. Add speech recognition and handler in `handle-user-input.protected.js`:
   ```javascript
   // In speech normalization section
   if (UserInput.toLowerCase().includes('support')) {
     UserInput = '4';
   }

   // In switch statement
   case '4':
     twiml.say('Connecting you to our support team');
     twiml.dial(context.SUPPORT_PHONE_NUMBER);
     break;
   ```

3. Add any necessary environment variable to `.env`:
   ```
   SUPPORT_PHONE_NUMBER=+15551234567
   ```

4. Add any required unit tests

## Further Resources

- [Twilio TwiML Voice Documentation](https://www.twilio.com/docs/voice/twiml)
- [Twilio Speech Recognition](https://www.twilio.com/docs/voice/twiml/gather#speechmodel)
- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)
- [Twilio Serverless Functions](https://www.twilio.com/docs/runtime/functions)