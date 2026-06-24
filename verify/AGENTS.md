# Twilio Verify - One-Time Passcode Verification

Serverless one-time passcode (OTP) verification using Twilio Verify with multi-channel support (SMS, voice call, WhatsApp, email) deployed on Twilio Functions.

## Commands

```bash
# Install dependencies
npm install

# Run locally
npm start
# Opens at http://localhost:3000/index.html

# Test
npm test

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
| `VERIFY_SERVICE_SID` | Console → Verify → Services | Starts with `VA` |

## Project Structure

```
functions/
  start-verify.js      # Sends OTP via SMS, call, WhatsApp, or email
  check-verify.js      # Validates user-provided OTP code
assets/
  index.html           # Web UI for testing verification flow
  styles.css           # Twilio Paste design system styles
  locales.js           # Multi-language support options
tests/                 # Unit tests for both functions
```

## Agent Boundaries

**Always:**
- Confirm `.env` is configured before running any command
- Use the Environment Variables section to guide the user to each credential — don't ask them to find values without direction
- Confirm the app is running before asking the user to test it
- Verify the Verify Service is created at https://console.twilio.com/verify/services

**Never:**
- Run the app with missing or placeholder credentials
- Hardcode credentials or phone numbers in source files
- Skip the `cp .env.example .env` step
- Use invalid phone number formats (must be E.164: +15551234567)

## Verify It's Working

1. Open http://localhost:3000/index.html in your browser
2. Select a verification channel (SMS, WhatsApp, voice call, or email)
3. Enter your phone number (with country code) or email address
4. Click "Get a one-time passcode" to receive the OTP
5. Enter the code in the modal dialog and click "Verify code"
6. You should see "Verification success!" in green

**Expected behavior:**
- SMS/WhatsApp/Call: You receive a code on your phone within 30 seconds
- Email: Check your inbox for a verification code email
- After entering the correct code, the system confirms "Verification success!"
- Incorrect codes show "Incorrect token!" in red

## Twilio Resources

- [Twilio Console](https://console.twilio.com) — credentials, Verify service configuration
- [Verify API Documentation](https://www.twilio.com/docs/verify/api)
- [Verify Quickstart](https://www.twilio.com/docs/verify/quickstarts)
- [Supported Languages](https://www.twilio.com/docs/verify/supported-languages)
- [Email Verification Setup](https://www.twilio.com/docs/verify/email)
