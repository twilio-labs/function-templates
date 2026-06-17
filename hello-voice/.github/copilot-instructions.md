<!-- Auto-synced from AGENTS.md — do not edit directly. -->
# Hello Voice

A Twilio Serverless Function template that responds to incoming voice calls with a TwiML `<Say>` response saying "Hello World".

## Commands

```bash
# Run locally (requires Twilio CLI with Serverless Toolkit plugin)
twilio serverless:start

# Expose webhooks locally
# Requires ngrok — install and authenticate at https://ngrok.com before running
ngrok http 3000
# Set the resulting URL as the Voice webhook in Twilio Console
```

## Project Structure

- `functions/hello-voice.protected.js` — Serverless Function handler; returns TwiML `<Say>Hello World</Say>`
- `tests/hello-voice.test.js` — Jest tests verifying the TwiML response shape

## Agent Boundaries

**Always:**
- Confirm the local dev server is running before asking the user to test the webhook
- Note that the `.protected` suffix on the function file means Twilio validates request signatures — direct browser access will be rejected; calls must come from Twilio

**Never:**
- Hardcode credentials or phone numbers in source files
- Tell the user to access the function URL directly in a browser to test it

## Verify It's Working

1. Start the local dev server with `twilio serverless:start` and expose it with ngrok
2. In [Twilio Console](https://console.twilio.com), assign the ngrok URL to a phone number under Voice → "A Call Comes In"
3. Call the number — you should hear "Hello World"

## Twilio Resources

- [Twilio Console](https://console.twilio.com) — phone numbers and webhook configuration
- [Voice TwiML docs](https://www.twilio.com/docs/voice/twiml)
- [Twilio Serverless Toolkit](https://www.twilio.com/docs/labs/serverless-toolkit)
