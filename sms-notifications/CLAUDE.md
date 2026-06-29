# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SMS broadcast notification system built on Twilio Functions (serverless). Users submit a web form with a passcode to send SMS messages to multiple recipients simultaneously.

## Commands

All commands are run from the monorepo root (`../`), not this subdirectory:

```bash
npm test                    # Run all Jest tests
npm test -- send-messages   # Run only this project's tests
npm run lint                # ESLint
npm run format              # Prettier (writes)
npm run format:check        # Prettier (check only)
```

To run the app locally:

```bash
twilio serverless:start     # Dev server at http://localhost:3000
twilio serverless:deploy    # Deploy to Twilio
```

## Architecture

**Runtime:** Twilio Functions (Node.js serverless). The Twilio SDK is pre-loaded by the runtime — no local `dependencies` are needed.

**Backend** (`functions/send-messages.js`): Standard Twilio Function handler `(context, event, callback)`. Validates a passcode from `context.PASSCODE`, then fans out `Promise.all()` SMS sends to each comma-separated recipient. Returns per-recipient success/failure — individual failures do not abort the batch.

**Frontend** (`assets/index.html` + `assets/index.js`): Single-page form that manages an in-memory recipients array, POSTs to `/send-messages`, and renders per-recipient results. Phone numbers must be E.164 format.

**Environment variables** (in `.env`):

- `TWILIO_PHONE_NUMBER` — sender number (E.164)
- `PASSCODE` — authorizes broadcast; validated server-side, returning 401 on mismatch

## Testing

Tests use Jest with a shared mock helper at `../../test/test-helper.js` (monorepo root). The helper provides `MockRuntime` and a `Response` stub that mimic the Twilio serverless environment. Coverage thresholds: 60% statements and branches on `functions/**/*.js`.
