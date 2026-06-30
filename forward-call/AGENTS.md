# Forward Call

Demonstrates how to forward an incoming call to a specified phone number using Twilio Serverless Functions and TwiML.

## Environment Variables

`.env` is included with placeholder values. Update it before running. Never commit `.env`.

| Variable | Where to find | Format |
| -------- | ------------- | ------ |
| `MY_PHONE_NUMBER` | Phone number you control — the destination for forwarded calls | E.164 format: `+15551234567` |
| `TWILIO_VOICE_WEBHOOK_URL` | Pre-set to `/forward-call` — do not change | `/forward-call` |

## Commands

```bash
# Install Twilio CLI serverless plugin (once)
twilio plugins:install @twilio-labs/plugin-serverless

# Initialize a new project from this template
# --skip-credentials skips the credential prompt (Serverless injects them at runtime)
twilio serverless:init example --template=forward-call --skip-credentials && cd example
# Edit .env — replace placeholder MY_PHONE_NUMBER with your real E.164 number

# Start the server
twilio serverless:start

# Expose locally via ngrok (run separately — install and authenticate at https://ngrok.com)
ngrok http 3000

# Configure the voice webhook on your Twilio number
# Find your phone number SID:
twilio api:core:incoming-phone-numbers:list
# Set the webhook (replace URL with your ngrok URL or deployed URL):
twilio api:core:incoming-phone-numbers:update \
  --sid <your-phone-number-sid> \
  --voice-url https://<your-ngrok-id>.ngrok.app/forward-call \
  --voice-method POST

# Deploy
twilio serverless:deploy --service-name forward-call
```

## Project Structure

- `functions/forward-call.protected.js` — main handler; dials `MY_PHONE_NUMBER` via TwiML
- `tests/forward-call.test.js` — Jest unit tests (run from the monorepo root, not this directory)
- `.env` — environment variables (never commit)

## Agent Boundaries

**Always:**

- Confirm `.env` is configured before running any command
- Use the Environment Variables section to guide the user to each credential — don't ask them to find values without direction
- Confirm the app is running before asking the user to test it
- Always use `--template=forward-call` when initializing a new project

**Never:**

- Run the app with missing or placeholder credentials
- Hardcode credentials or phone numbers in source files
- Run with placeholder values still in `.env`

## Verify It's Working

1. Call your Twilio phone number
2. The call should ring through to the number set in `MY_PHONE_NUMBER`

## Twilio Resources

- [Twilio Console](https://console.twilio.com) — credentials, phone numbers, webhook configuration
- [Twilio Serverless Toolkit](https://www.twilio.com/docs/labs/serverless-toolkit) — deploy and manage Serverless Functions
- [TwiML for Voice](https://www.twilio.com/docs/voice/twiml) — reference for the VoiceResponse used in this template
- [Programmable Voice](https://www.twilio.com/docs/voice) — Voice API reference
