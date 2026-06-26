# Voice IVR

This sample demonstrates a phone tree (IVR) using Twilio Voice and Programmable SMS, where callers navigate options by keypad or speech-to-text to reach sales, hear hours, or receive an address by SMS.

## Environment Variables

Copy `.env.example` to `.env`. Never commit `.env`.

```bash
cp .env.example .env
```

| Variable | Where to find | Format |
| -------- | ------------- | ------ |
| `MY_PHONE_NUMBER` | The phone number you want the Sales option to forward calls to — use your own mobile during development | E.164 format: `+15551234567` |

> Note: `ACCOUNT_SID` and `AUTH_TOKEN` are injected automatically by Twilio Serverless and do not need to be set in `.env`.

## Commands

```bash
# Install Twilio CLI serverless plugin (once)
twilio plugins:install @twilio-labs/plugin-serverless

# Initialize a new project from this template
twilio serverless:init example --template=voice-ivr && cd example

# Run locally
twilio serverless:start

# Expose webhooks locally
# Requires ngrok — install and authenticate at https://ngrok.com before running
ngrok http 3000
# Set the resulting HTTPS URL + /voice-ivr as the webhook in Twilio Console (Voice → A Call Comes In → POST)

# Deploy to Twilio Serverless
twilio serverless:deploy

# Test
npm test
```

## Project Structure

- `functions/voice-ivr.protected.js` — entry point; presents the IVR menu via TwiML `<Gather>`
- `functions/handle-user-input.protected.js` — handles digit/speech input; forwards call, reads hours, or sends SMS
- `.env.example` — environment variable template
- `tests/` — Jest test suite

## Agent Boundaries

**Always:**

- Confirm `.env` is configured before running any command
- Use the Environment Variables section to guide the user to each credential — don't ask them to find values without direction
- Confirm the app is running before asking the user to test it

**Never:**

- Run the app with missing or placeholder credentials
- Hardcode credentials or phone numbers in source files
- Skip the `cp .env.example .env` step

## Verify It's Working

1. Call your Twilio phone number. You should hear the IVR prompt offering three options.
2. Press `1` (or say "Sales") — the call should forward to the number set in `MY_PHONE_NUMBER`. Press `3` (or say "Address") — you should receive an SMS with the address to the caller's number within a few seconds.

## Twilio Resources

- [Twilio Console](https://console.twilio.com) — credentials, phone numbers, webhook configuration
- [Twilio Voice TwiML](https://www.twilio.com/docs/voice/twiml) — TwiML verb reference
- [Twilio Serverless Toolkit](https://www.twilio.com/docs/labs/serverless-toolkit) — deploy and manage Twilio Functions
- [Programmable SMS](https://www.twilio.com/docs/sms) — SMS API reference
