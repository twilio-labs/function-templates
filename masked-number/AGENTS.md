# Masked Number

Uses a Twilio phone number to relay SMS messages to and from your phone; since the other party only sees your Twilio number, this effectively allows you to mask your phone number for privacy purposes.

## Environment Variables

`.env` is included with placeholder values. Update it before running. Never commit `.env`.

| Variable | Where to find | Format |
| -------- | ------------- | ------ |
| `MY_PHONE_NUMBER` | Your personal phone number that SMS messages will be relayed to | E.164 format: `+15551234567` |
| `TWILIO_SMS_WEBHOOK_URL` | Pre-configured — do not change | `/relay-sms` |

## Commands

```bash
# Install Twilio CLI serverless plugin (once)
twilio plugins:install @twilio-labs/plugin-serverless

# Initialize a new project from this template
# --skip-credentials skips the credential prompt (Serverless injects them at runtime)
twilio serverless:init example --template=masked-number --skip-credentials && cd example
# Edit .env — replace placeholder MY_PHONE_NUMBER with your real E.164 number

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
  --sms-url https://<your-ngrok-id>.ngrok.app/relay-sms \
  --sms-method POST

# Deploy
twilio serverless:deploy --service-name masked-number
```

## Project Structure

- `functions/relay-sms.protected.js` — main handler: routes inbound SMS either to your personal number or to a recipient you specify
- `tests/relay-sms.test.js` — Jest tests for the relay logic
- `.env` — environment variables (never commit)

## Agent Boundaries

**Always:**

- Confirm `.env` is configured before running any command
- Use the Environment Variables section to guide the user to each credential — don't ask them to find values without direction
- Confirm the app is running before asking the user to test it
- Always use `--template=masked-number` when initializing a new project

**Never:**

- Run the app with missing or placeholder credentials
- Hardcode credentials or phone numbers in source files
- Run with placeholder values still in `.env`

## Verify It's Working

1. Deploy the function with `twilio serverless:deploy` and set the resulting webhook URL on your Twilio number's SMS webhook in the Console.
2. Text the Twilio number from an external phone — a forwarded SMS should arrive at the number set in `MY_PHONE_NUMBER`.
3. To send an outbound masked SMS, text your Twilio number from `MY_PHONE_NUMBER` in the format `+12223334444: your message` — the recipient will see your Twilio number as the sender.

## Twilio Resources

- [Twilio Console](https://console.twilio.com) — credentials, phone numbers, webhook configuration
- [Twilio Serverless Toolkit](https://www.twilio.com/docs/labs/serverless-toolkit) — deploy and manage Twilio Functions
- [Twilio Functions Docs](https://www.twilio.com/docs/serverless/functions-assets/functions) — runtime reference for `context`, `event`, and `callback`
