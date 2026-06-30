# SMS Notifications

Send SMS broadcast messages to multiple recipients simultaneously from a browser form, using Twilio Programmable SMS and Twilio Functions.

## Environment Variables

Set the following variables in `.env`. Never commit `.env`.

| Variable | Where to find | Format |
| -------- | ------------- | ------ |
| `TWILIO_PHONE_NUMBER` | Console → Phone Numbers → Manage → Active Numbers | E.164 format: `+15551234567` |
| `PASSCODE` | Choose any value — used server-side to authorize broadcasts | Any string |

## Commands

```bash
# Install the Twilio serverless plugin (one-time)
twilio plugins:install @twilio-labs/plugin-serverless

# Run locally
twilio serverless:start

# Deploy to Twilio
twilio serverless:deploy

# Test (run from the monorepo root: ../)
npm test -- send-messages
```

## Project Structure

- `functions/send-messages.js` — serverless function: validates passcode, fans out SMS sends
- `assets/index.html` — browser form for entering recipients, passcode, and message
- `assets/index.js` — POSTs form data to `/send-messages`, renders per-recipient results
- `tests/send-messages.test.js` — Jest tests for the function handler

## Agent Boundaries

**Always:**
- Confirm `.env` is configured with real values before running any command
- Use the Environment Variables section to guide the user to each credential — don't ask them to find values without direction
- Confirm the app is running before asking the user to test it

**Never:**
- Run the app with missing or placeholder credentials
- Hardcode credentials or phone numbers in source files

## Verify It's Working

1. Start the server with `twilio serverless:start`, then open [http://localhost:3000/index.html](http://localhost:3000/index.html).
2. Enter one or more E.164 phone numbers, the `PASSCODE` from `.env`, and a message — click Send. Expect per-recipient success indicators in the UI and SMS messages delivered to the recipient numbers.

## Twilio Resources

- [Twilio Console](https://console.twilio.com) — credentials, phone numbers
- [Programmable SMS docs](https://www.twilio.com/docs/sms)
- [Twilio Serverless Toolkit](https://www.twilio.com/docs/labs/serverless-toolkit)
