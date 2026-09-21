# Changelog

## [Unreleased]

## [2.0.0]

### Changed

- Migrated from the preview Comms Passkeys API to the [Verify Passkeys API](https://www.twilio.com/docs/verify/quickstarts/passkeys).
- Calls now go through the Twilio Node helper library (`context.getTwilioClient().verify.v2`) instead of raw `axios` requests. `axios` is no longer a dependency and `twilio` is bumped to `^5.12.0`, the first release shipping the passkeys resources.

### Added

- `/registration/service` endpoint to create the passkeys enabled Verify Service and return its `VERIFY_SERVICE_SID`.
- `/.well-known/webauthn` endpoint serving the allowed origins for related origin requests.
- CORS headers on the passkeys endpoints so the mobile SDKs can call them.

- Native app support driven by environment variables: `IOS_APP_ID`, `ANDROID_PACKAGE_NAME` and `ANDROID_SHA256_CERT_FINGERPRINT`. The Android WebAuthn origin (`android:apk-key-hash:...`) is derived from the signing fingerprint, so there is nothing to compute or hand-edit.

### Fixed

- `/.well-known/apple-app-site-association` is now served by a Function. As a static asset it has no file extension, so the assets pipeline uploaded it without a content type and it was served as `application/octet-stream`, which Apple rejects.
- `ACCOUNT_SID` and `AUTH_TOKEN` are now in `.env.example`. They were listed in the README but missing from the file it tells you to copy, so a local run failed in `getTwilioClient()`.

- Renamed the `SERVICE_SID` environment variable to `VERIFY_SERVICE_SID`. `SERVICE_SID` is a reserved context variable on deployed Functions holding the Serverless Service SID, so the Verify Service SID was being shadowed in production.
- `assets/origins.js` is now `assets/origins.private.js`. `Runtime.getAssets()` only exposes private assets, so `/.well-known/webauthn` and `/registration/service` threw at load time.

### Removed

- `API_URL` and `ANDROID_APP_KEYS` environment variables. The helper library resolves the API URL, and extra origins now live in `assets/origins.private.js`.

## [1.0.0]
### Added
- Initial release.

