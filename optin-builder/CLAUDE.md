# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start           # Start local dev server (twilio serverless:start --live) at http://localhost:3000
npm test            # Run the full Jest test suite
npm run deploy      # Deploy to Twilio Serverless
```

Run a single test file:

```bash
npm test -- tests/receive-sms.test.js
```

There is no lint script configured; ESLint is used informally via IDE.

## Architecture

This is a Twilio Serverless app — a backend-only SDK with no traditional HTTP framework.
Functions live in `functions/` and follow the pattern:

```js
exports.handler = function (context, event, callback) { ... }
```

`context` holds environment variables and the Twilio client.
`event` is the incoming request. `callback(null, response)` sends the response.

**File suffixes are meaningful to Twilio:**

- `.protected.js` — requires a valid Twilio signature (only Twilio webhooks can call it)
- `.private.js` — internal-only, not exposed as an HTTP endpoint
- No suffix — public HTTP endpoint

**Cross-function imports** use `Runtime.getFunctions()`:

```js
const { redactVariable } = require(Runtime.getFunctions()['utils'].path);
```

**Settings are persisted as Twilio environment variables** (not a database).
`save-settings.js` calls the Twilio REST API to update env vars on the deployed service.
This means settings persistence only works on deployed instances — local dev requires editing `.env` manually and restarting.

## Data flow

1. User visits `assets/index.html` (served as a static asset)
2. Page fetches `/get-settings` → returns current env vars (sensitive values redacted)
3. Desktop: user submits phone → `/send-sms` → Twilio sends initial SMS prompt
4. User replies with opt-in keyword → Twilio webhook → `/receive-sms.protected.js`
5. `receive-sms` records the contact in the configured `DATA_SOURCE` (airtable, segment, or webhook)

## Testing patterns

Tests use `rewire` to replace private/unexported functions with stubs, and `sinon` for spies.
The mocks in `tests/mocks/mock-require.js` set up global stubs (Twilio SDK, Runtime, etc.) before each test file.
Jest globals (`describe`, `it`, `expect`) are used alongside `chai` assertions — both are in scope.

When writing a new test, mirror the rewire setup in existing test files: `rewire` the function module, then use `.__set__` to inject mocks before calling the handler.

## Key environment variables

See `.env.example` for the full annotated list. Critical ones:

- `DATA_SOURCE` — `"airtable"`, `"segment"`, or `"webhook"` (determines which integration is active)
- `OPT_IN_KEYWORD` — the SMS keyword that completes the double opt-in flow
- `ADMIN_PHONE_NUMBER` + `ADMIN_PASSWORD` — gate for the settings panel in the UI

Missing `CAMPAIGN_TITLE`, `CAMPAIGN_DESCRIPTION`, `MESSAGE_FREQUENCY`, `CONTACT_INFORMATION`, or `PRIVACY_POLICY_LINK` triggers a compliance warning in the UI (shown to admins via `get-settings.js`).
