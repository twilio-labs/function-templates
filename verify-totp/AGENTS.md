# Authenticator App (TOTP) Authentication with Twilio Verify

Serverless two-factor authentication (2FA) using the Twilio Verify API's TOTP factor, so users can enroll an authenticator app (Google Authenticator, Microsoft Authenticator, Authy, 1Password) by scanning a QR code and then authenticate with the 6-digit time-based code it generates.

## Environment Variables

`.env` ships with the template. `twilio serverless:init` populates `ACCOUNT_SID` and `AUTH_TOKEN` from your Twilio CLI profile; you must fill in `VERIFY_SERVICE_SID` yourself. Never commit `.env`.

| Variable | Where to find | Format |
| -------- | ------------- | ------ |
| `ACCOUNT_SID` | [Console](https://console.twilio.com) homepage — auto-populated by `serverless:init` | Starts with `AC` |
| `AUTH_TOKEN` | Console homepage → click to reveal — auto-populated by `serverless:init` | 32-char string. Treat as a password. |
| `VERIFY_SERVICE_SID` | Console → Verify → Services (create one if none exists) | Starts with `VA` |

## Commands

```bash
# Install the Twilio CLI serverless plugin (once)
twilio plugins:install @twilio-labs/plugin-serverless

# Initialize a new project from this template
twilio serverless:init totp-sample-app --template=verify-totp && cd totp-sample-app
# Then add VERIFY_SERVICE_SID to .env

# Run locally at http://localhost:3000/index.html
twilio serverless:start

# Test (from the function-templates repo root)
npm test verify-totp

# Deploy
twilio serverless:deploy
```

No Twilio webhooks are involved — the browser calls the Functions directly, so ngrok is not needed.

## Project Structure

```
functions/
  create-factor.js       # Creates a TOTP factor; returns identity, factorSid, otpauth URI, and secret
  verify-new-factor.js   # Completes enrollment by validating the first code from the authenticator app
  create-challenge.js    # Ongoing authentication: creates a challenge with a code the user supplies
assets/
  index.html             # Demo UI: QR code enrollment, factor verification, ongoing challenges
  helpers.js             # Public browser helpers (status messages, sessionStorage state)
  utils.private.js       # Server-side only: detectMissingParams (private assets are not web-accessible)
tests/                   # Jest tests for all three functions
```

## Agent Boundaries

**Always:**

- Confirm `.env` is configured before running any command
- Use the Environment Variables section to guide the user to each credential — don't ask them to find values without direction
- Create a Verify Service first if the user has no `VERIFY_SERVICE_SID` (Console → Verify → Services)
- Confirm the app is running before asking the user to test it
- Use `--template=verify-totp` when initializing a new project
- Keep `identity` a random, opaque value (the template uses `uuidv4()`) — Verify entity identities must not contain PII
- Keep server-only helpers in `*.private.js` assets so they are not served to the browser

**Never:**

- Run the app with missing or placeholder credentials
- Hardcode credentials, secrets, or TOTP seeds in source files
- Log or persist the `secret` / `uri` returned by `create-factor` beyond showing the QR code once during enrollment
- Assume an unverified factor persists — unverified factors are deleted between 1 and 24 hours after creation, so re-enroll rather than reusing a stale `factorSid`

## Verify It's Working

1. Open http://localhost:3000/index.html and enter a username, then click "Set up two-factor authentication" — a QR code and a text secret appear.
2. Scan the QR code (or type the secret) into an authenticator app, then enter the 6-digit code to verify the new factor. Success shows "Factor setup complete!" in green.
3. Enter a fresh code from the authenticator app in the ongoing authentication form — a valid code returns "Verification success." and an invalid or expired one returns "Incorrect token."

Errors surface in the page status line and the browser console; a 400 with "Missing parameter" means the request omitted `identity`, `factorSid`, or `code`.

## Twilio Resources

- [Twilio Console](https://console.twilio.com) — credentials and Verify Service configuration
- [Verify TOTP Quickstart](https://www.twilio.com/docs/verify/quickstarts/totp) — end-to-end walkthrough and TOTP service settings
- [Verify Factor API](https://www.twilio.com/docs/verify/api/factor) — creating and verifying factors
- [Verify Challenge API](https://www.twilio.com/docs/verify/api/challenge) — ongoing authentication
- [What is TOTP?](https://www.twilio.com/docs/glossary/totp) — how time-based codes work
