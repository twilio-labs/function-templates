# Forward Message

Demonstrates how to forward an incoming SMS to one or more phone numbers using Twilio Serverless Functions and TwiML.

## Environment Variables

`.env` is included with placeholder values. Update it before running. Never commit `.env`.

| Variable | Where to find | Format |
| -------- | ------------- | ------ |
| `FORWARDING_NUMBERS` | Phone numbers you control — the destinations for forwarded SMS | Comma-separated E.164 values: `+15551234567,+15557654321` |
| `TWILIO_SMS_WEBHOOK_URL` | Pre-set to `/forward-message` — do not change | `/forward-message` |

## Commands

```bash
# Install Twilio CLI serverless plugin (once)
twilio plugins:install @twilio-labs/plugin-serverless

# Initialize a new project from this template
# --skip-credentials skips the credential prompt (Serverless injects them at runtime)
twilio serverless:init example --template=forward-message --skip-credentials && cd example
# Edit .env — replace placeholder FORWARDING_NUMBERS with real E.164 numbers

# Start the server
twilio serverless:start

# Expose locally via ngrok (run separately — install and authenticate at https://ngrok.com)
ngrok http 3000

# Configure the SMS webhook on your Twilio number
# Find your phone number SID:
twilio api:core:incoming-phone-numbers:list
# Set the webhook (replace URL with your ngrok URL or deployed URL):
twilio api:core:incoming-phone-numbers:update \
  --sid <your-phone-number-sid> \
  --sms-url https://<your-ngrok-id>.ngrok.app/forward-message \
  --sms-method POST

# Deploy
twilio serverless:deploy --service-name forward-message
```

## Project Structure

- `functions/forward-message.protected.js` — main handler; forwards incoming SMS to each number in `FORWARDING_NUMBERS`
- `tests/forward-message.test.js` — Jest unit tests (run from the monorepo root, not this directory)
- `.env` — environment variables (never commit)

## Agent Boundaries

**Always:**

- Confirm `.env` is configured before running any command
- Use the Environment Variables section to guide the user to each credential — don't ask them to find values without direction
- Confirm the app is running before asking the user to test it
- Always use `--template=forward-message` when initializing a new project

**Never:**

- Run the app with missing or placeholder credentials
- Hardcode credentials or phone numbers in source files
- Run with placeholder values still in `.env`

## Verify It's Working

1. Text any message to your Twilio phone number
2. Every number listed in `FORWARDING_NUMBERS` should receive an SMS in the format: `From: <sender>. Body: <original message>`

## Twilio Resources

- [Twilio Console](https://console.twilio.com) — credentials, phone numbers, webhook configuration
- [Twilio Serverless Toolkit](https://www.twilio.com/docs/labs/serverless-toolkit) — deploy and manage Serverless Functions
- [TwiML for Messaging](https://www.twilio.com/docs/sms/twiml) — reference for the MessagingResponse used in this template
- [Programmable SMS](https://www.twilio.com/docs/sms) — SMS API reference
