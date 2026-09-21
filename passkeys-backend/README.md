# Verify Passkeys

Verify enables developers to easily add Passkeys into their existing authentication flows, similar to Verify TOTP and Push. The Verify API supports passkey registration, public key storage, and auth flows. On the client-side, developers can optionally embed an open-source library (SDK) that handles interactions with operating systems and customizable UI widgets that maximize conversion.

The functions talk to the Verify Passkeys API through the [Twilio Node helper library](https://www.twilio.com/docs/libraries/reference/twilio-node) (`context.getTwilioClient().verify.v2`), so there is no API URL or HTTP client to configure. See the [Verify Passkeys quickstart](https://www.twilio.com/docs/verify/quickstarts/passkeys) for the full API reference.

## How to use the template

The best way to use the Function templates is through the Twilio CLI as described below. If you'd like to use the template without the Twilio CLI, [check out our usage docs](../docs/USING_FUNCTIONS.md).

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. A file named `.env` is used to store the values for those environment variables. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

You can find a `.env.example` file to copy for creating your own `.env` file

In your `.env` file, set the following values:

| Variable | Description | Required |
| :------- | :---------- | :------- |
| `ACCOUNT_SID`        | Find in the [console](https://www.twilio.com/console) | Yes |
| `AUTH_TOKEN`         | Find in the [console](https://www.twilio.com/console) | Yes |
| `VERIFY_SERVICE_SID` | Verify Service with Passkeys enabled. See [Obtaining the VERIFY_SERVICE_SID](#obtaining-the-verify_service_sid) | No |
| `IOS_APP_ID`         | See [Using this backend from an iOS or Android app](#using-this-backend-from-an-ios-or-android-app) | No |
| `ANDROID_PACKAGE_NAME` | See [Using this backend from an iOS or Android app](#using-this-backend-from-an-ios-or-android-app) | No |
| `ANDROID_SHA256_CERT_FINGERPRINT` | See [Using this backend from an iOS or Android app](#using-this-backend-from-an-ios-or-android-app) | No |

`ACCOUNT_SID` and `AUTH_TOKEN` are needed because every Function in this template calls the Verify API through `context.getTwilioClient()`:

- **Running locally**, the development server does not pick up your Twilio CLI profile. Put both values in `.env` (or export them in your shell and start with `--load-local-env`), otherwise `getTwilioClient()` throws.
- **Once deployed**, enable them in your [Functions configuration](https://www.twilio.com/console/functions/configure) instead of storing them as environment variables.

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init passkeys-sample --template=passkeys-backend && cd passkeys-sample
```

4. Add your environment variables to `.env`:

Make sure variables are populated in your `.env` file. See [Environment variables](#environment-variables).

5. Start the server :

```
npm start
```

5. Open the web page at https://localhost:3000/index.html and enter your phone number to test

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

ℹ️ Passkeys require the relying party to match the domain serving the page, so the local server can only be used against `localhost`. To test from a device, deploy the project first.

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```

## Working with this project

The following describes customization options and more details for understanding how this application works.

### Using this backend from an iOS or Android app

Native apps only get to use the passkeys stored for this domain if the domain publicly declares that it trusts them, and if the Verify Service accepts the origin the app reports. Both sides are driven by environment variables, so there are no files to hand-edit.

Set the values for the platforms you need and redeploy:

| Variable | Platform | Where to find it |
| :------- | :------- | :--------------- |
| `IOS_APP_ID` | iOS | `<Team ID>.<bundle identifier>`, e.g. `ABCDE12345.com.example.passkeys`. The Team ID is in the [Apple Developer account page](https://developer.apple.com/account). |
| `ANDROID_PACKAGE_NAME` | Android | The `applicationId` of your app module, e.g. `com.example.passkeys`. |
| `ANDROID_SHA256_CERT_FINGERPRINT` | Android | Colon separated SHA-256 of the signing certificate: `keytool -list -v -keystore <keystore> -alias <alias>`. For Play-signed builds use the fingerprint shown in Play Console → Setup → App signing. |

The template then serves everything the platforms look for:

| Endpoint | Used by | Purpose |
| :------- | :------ | :------ |
| `/.well-known/apple-app-site-association` | iOS | Declares `IOS_APP_ID` under `webcredentials`. Served from a Function so it gets a `application/json` content type, which Apple requires. |
| `/.well-known/assetlinks.json` | Android | Digital Asset Links statement with `delegate_permission/common.get_login_creds` for `ANDROID_PACKAGE_NAME`. |
| `/.well-known/webauthn` | Browsers | Related origin requests, so other origins in the list can use the same passkeys. |

On the app side:

- **iOS:** add `webcredentials:<your-domain>` to the Associated Domains capability. iOS reports `https://<your-domain>` as the origin, which is always in the allow list.
- **Android:** use the Credential Manager API with the same package name and signing key. Android reports its origin as `android:apk-key-hash:<base64url SHA-256 of the signing certificate>`; `assets/origins.private.js` derives that value from `ANDROID_SHA256_CERT_FINGERPRINT`, so you do not need to compute it yourself.

The endpoints also send permissive CORS headers so the apps and any allowed web origin can call them.

⚠️ The allowed origins are baked into the Verify Service when it is created. If you set `ANDROID_SHA256_CERT_FINGERPRINT` after creating the service, update the service's origins in the [console](https://www.twilio.com/console/verify/services) or create a new one.

### Service customization

`assets/origins.private.js` builds the list of origins from which passkey creation and authentication is allowed. Edit it if you need to allow origins beyond the deployed domain and the Android app.

#### Obtaining the VERIFY_SERVICE_SID

In order to start working with the rest of the Twilio Verify Passkeys API, you will need a Verify Service with Passkeys enabled. You can create one by calling the `/registration/service` endpoint once:

```
curl -X POST https://<your-domain>/registration/service
```

The response contains the `sid` of the new service. Set it as `VERIFY_SERVICE_SID` in your environment variables and redeploy.

Inside that function you can modify the parameters of the service creation, like `friendlyName` or `passkeys.relyingParty.name`, to customize it to your needs.

### Function Parameters

`/registration/service` a POST request, does not expect parameters

`/registration/start` expects the following parameters:

| Parameter | Description | Required |
| :-------- | :---------- | :------- |
| username | user identification name | yes


`/registration/verification` expects the following parameters:

| Parameter | Description | Required |
| :-------- | :---------- | :------- |
| id | A base64url encoded representation of `rawId`. | yes |
| rawId | The globally unique identifier for this `PublicKeyCredential`. | yes |
| attestationObject | A base64url encoded object given by the `AuthenticatorAttestationResponse` | yes |
| clientDataJSON | A base64url encoded object given by the `AuthenticatorAttestationResponse` | yes |
| transports | An Array with the transport methods given by the `AuthenticatorAttestationResponse` | yes |


`/authentication/start` a GET request, does not expect parameters

`/authentication/verification` expects the following parameters:

| Parameter | Description | Required |
| :-------- | :---------- | :------- |
| id | A base64url encoded representation of `rawId`. | yes |
| rawId | The globally unique identifier for this `PublicKeyCredential`. | yes |
| authenticatorData | A base64url encoded object given by the `AuthenticatorAttestationResponse` | yes |
| clientDataJSON | A base64url encoded object given by the `AuthenticatorAttestationResponse` | yes |
| signature | A base64url encoded object given by the `AuthenticatorAttestationResponse` | yes |
| userHandle | A base64url encoded object given by the `AuthenticatorAttestationResponse` | yes |
