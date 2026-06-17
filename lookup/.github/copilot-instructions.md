<!-- Auto-synced from AGENTS.md — do not edit directly. -->
# Phone Number Lookup

A Twilio Serverless Function and web UI that lets you look up detailed intelligence about any phone number using the Twilio Lookup v2 API — including validation, line type, carrier, caller name, SMS pumping risk, SIM swap detection, and more.

## Commands

```bash
# Initialize a new project from this template
twilio serverless:init lookup-sample --template=lookup && cd lookup-sample

# Install dependencies
npm install

# Run locally
npm start

# Open the UI
# Visit http://localhost:3000/index.html in your browser

# Deploy to Twilio
twilio serverless:deploy
```

## Environment Variables

Copy `.env.example` to `.env`. Never commit `.env`.

```bash
cp .env.example .env
```

| Variable | Where to find | Format |
| -------- | ------------- | ------ |
| `ACCOUNT_SID` | [Console](https://console.twilio.com) homepage | Starts with `AC` |
| `AUTH_TOKEN` | Console homepage → click to reveal | 32-char string. Treat as a password. |

## Project Structure

- `functions/lookup.js` — Serverless Function handler; calls the Lookup v2 API and returns phone number intelligence as JSON
- `assets/index.html` — Web UI; accepts a phone number and selected data packages, displays the JSON response
- `tests/lookup.test.js` — Jest tests for the Function handler

## Agent Boundaries

**Always:**
- Confirm `.env` is populated with `ACCOUNT_SID` and `AUTH_TOKEN` before starting the server
- Remind the user that Validation and Formatting is free; all other data packages are billed per lookup
- Note that SIM Swap, Call Forwarding, and Line Status require additional carrier approval before use

**Never:**
- Hardcode credentials in source files
- Run the app with missing or placeholder credentials

## Verify It's Working

1. Start the server with `npm start` and open `http://localhost:3000/index.html`
2. Enter any phone number, select one or more data packages, and click **Lookup** — you should see a JSON response with the number's validation status and the requested intelligence fields

## Twilio Resources

- [Twilio Console](https://console.twilio.com) — credentials and account management
- [Lookup v2 API docs](https://www.twilio.com/docs/lookup/v2-api)
- [Lookup data packages](https://www.twilio.com/docs/lookup/v2-api#data-packages)
- [Twilio Serverless Toolkit](https://www.twilio.com/docs/labs/serverless-toolkit)
