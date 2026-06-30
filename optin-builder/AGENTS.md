# Twilio Opt-In Builder

A Twilio Serverless app that provides an embeddable SMS opt-in form for collecting campaign contacts, with a live editor, compliance language generation, and support for Airtable, Segment, or webhook integrations.

## Environment Variables

Copy `.env.example` to `.env`. Never commit `.env`.

```bash
cp .env.example .env
```

| Variable | Where to find | Format |
| -------- | ------------- | ------ |
| `ADMIN_PHONE_NUMBER` | Your personal phone number — used as the settings panel username and to receive config-change notifications | E.164 format: `+15551234567` |
| `ADMIN_PASSWORD` | Choose a strong password — used to authenticate access to the live editor settings panel | Any string |
| `TWILIO_PHONE_NUMBER` | Console → Phone Numbers → Manage → Active Numbers | E.164 format: `+15551234567` |
| `CAMPAIGN_TITLE` | The name/title of your opt-in campaign (required for compliance) | Any string |
| `CAMPAIGN_DESCRIPTION` | Brief description of what messages the subscriber will receive (required for compliance) | Any string |
| `MESSAGE_FREQUENCY` | How often messages are sent, e.g. "4 msgs / month" (required for compliance) | Any string |
| `OPT_IN_KEYWORD` | The SMS keyword the user texts to complete double opt-in | Any single word, e.g. `YES` |
| `SUBSCRIBE_CONFIRMATION` | Message sent to the user after double opt-in is confirmed | Any string |
| `CONTACT_INFORMATION` | Support email or toll-free number for Terms of Service (required for compliance) | Any string |
| `PRIVACY_POLICY_LINK` | URL to your organization's privacy policy (recommended for compliance) | URL |
| `DATA_SOURCE` | Which backend stores opt-ins | `webhook`, `airtable`, or `segment` |
| `WEBHOOK_URL` | URL to receive opt-in events (if `DATA_SOURCE=webhook`) | URL |
| `SEGMENT_WRITE_KEY` | Segment Node.js source write key (if `DATA_SOURCE=segment`) | Any string |
| `AIRTABLE_API_KEY` | Airtable API key (if `DATA_SOURCE=airtable`) | Any string |
| `AIRTABLE_BASE_ID` | Airtable base ID (if `DATA_SOURCE=airtable`) | Starts with `app` |
| `AIRTABLE_TABLE_NAME` | Name of the Airtable table for opt-ins (if `DATA_SOURCE=airtable`) | Any string |
| `AIRTABLE_PHONE_COLUMN_NAME` | Column name for phone numbers in Airtable (if `DATA_SOURCE=airtable`) | Any string |
| `AIRTABLE_OPT_IN_COLUMN_NAME` | Column name for opt-in status in Airtable (if `DATA_SOURCE=airtable`) | Any string |
| `LOGO_URL` | Publicly accessible URL to your organization's logo (optional) | URL |
| `BUTTON_CTA` | Text on the opt-in submit button (optional) | Any string, e.g. `Join` |
| `BACKGROUND_COLOR` | Background color for the signup page (optional) | Hex color, e.g. `#ffffff` |
| `FONT_COLOR` | Font color for the signup page (optional) | Hex color, e.g. `#000000` |
| `CUSTOM_CSS` | URL to a custom stylesheet (optional) | URL |

## Commands

```bash
# Install
npm install

# Run locally (live reload)
npm start

# Deploy to Twilio Serverless
npm run deploy

# Test
npm test

# Run a single test file
npm test -- tests/receive-sms.test.js

# Expose webhooks locally
# Requires ngrok — install and authenticate at https://ngrok.com before running
ngrok http 3000
# Set the resulting URL + /receive-sms as the SMS webhook in Twilio Console for your phone number
```

## Project Structure

- `functions/` — Serverless function handlers (public, protected, private variants)
- `functions/receive-sms.protected.js` — Twilio webhook handler that records opt-ins to the configured data source
- `functions/send-sms.js` — Sends the initial opt-in prompt SMS to a user
- `functions/save-settings.js` — Persists env var settings via Twilio REST API (deployed instances only)
- `assets/index.html` — The embeddable opt-in form and live editor UI
- `tests/` — Jest test suite with rewire-based mocks

## Agent Boundaries

**Always:**
- Confirm `.env` is configured before running any command
- Confirm `ADMIN_PHONE_NUMBER`, `ADMIN_PASSWORD`, and `TWILIO_PHONE_NUMBER` are set — the app cannot start meaningfully without them
- Use the Environment Variables section to guide the user to each credential — don't ask them to find values without direction
- Confirm the app is running before asking the user to test it
- Remind the user that settings saved via the live editor only persist on deployed instances — local dev requires editing `.env` and restarting

**Never:**
- Run the app with missing or placeholder credentials
- Hardcode credentials or phone numbers in source files
- Skip the `cp .env.example .env` step

## Verify It's Working

1. Deploy with `npm run deploy`. Open the URL printed at the end (e.g. `https://[my-runtime-url].twil.io/index.html`) in a browser — you should see the opt-in form.
2. Enter a phone number in the form and submit. The number in `TWILIO_PHONE_NUMBER` (from `.env`) will send an SMS prompt; reply with the keyword in `OPT_IN_KEYWORD` and expect the `SUBSCRIBE_CONFIRMATION` message back.

## Twilio Resources

- [Twilio Console](https://console.twilio.com) — credentials, phone numbers, webhook configuration
- [Twilio Serverless Toolkit docs](https://www.twilio.com/docs/labs/serverless-toolkit)
- [SMS Messaging docs](https://www.twilio.com/docs/sms)
- [Phone Numbers — Active Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/active)
