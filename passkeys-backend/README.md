# Verify Passkeys

Verify enables developers to easily add Passkeys into their existing authentication flows, similar to Verify TOTP and Push. The Verify API supports passkey registration, public key storage, and auth flows. On the client-side, developers can optionally embed an open-source library (SDK) that handles interactions with operating systems and customizable UI widgets that maximize conversion.

## How to use the template

The best way to use the Function templates is through the Twilio CLI as described below. If you'd like to use the template without the Twilio CLI, [check out our usage docs](../docs/USING_FUNCTIONS.md).

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. A file named `.env` is used to store the values for those environment variables. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

- Enable ACCOUNT_SID and AUTH_TOKEN in your functions configuration (https://www.twilio.com/console/functions/configure)

You can find a `.env.example` file to copy for creating your own `.env` file

In your `.env` file, set the following values:

| Variable | Description | Required |
| :------- | :---------- | :------- |
| `API_URL`            | Passkeys API to point at                              | Yes |
| `ACCOUNT_SID`        | Find in the [console](https://www.twilio.com/console) | Yes |
| `AUTH_TOKEN`         | Find in the [console](https://www.twilio.com/console) | Yes |
| `NAMESPACE`   | UUID for generating deterministic UUIDs with the uuid library for username conversion  | Yes  |
| `SERVICE_SID`         | Service created in Twilio verify | No |

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

6. [optional] Configure email verification

[Follow the instructions in the docs](https://www.twilio.com/docs/verify/email) to set up email verification.

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```

## Working with this project

The following describes customization options and more details for understanding how this application works.

### Service customization

Besides the enviroment variables files, the project also contain two files called `assetlink.json` and `apple-app-site-association` inside `./assets/.well-know/`, that is a public file that contains the identificators for the apps that will be connecting the service.

`apple-app-site-association` contains identificator hash for the origin app in iOS:

| Variable | Description | Required |
| :------- | :---------- | :------- |
| ORIGIN_IOS_APP_HASH | Replace it with the identificator of the iOS app | yes |

`assetlink.json` contains identificator hash for the origin apps in android and web:

| Variable | Description | Required |
| :------- | :---------- | :------- |
| RELYING_PARTY | Replace it with the value of the relaying party | yes |
| FINGERPRINT_CERTIFICATION_HASH | Replace it with the hash fingerprint given by android app in format SHA256 | yes |

`origins.js` contains the origins from where passkeys creation and authentication will be allowed

##### Obtaining the SERVICE_SID

In order to start working with the rest of The Twilio Verify Passkeys API, you will need to create a Verify Service. You can do this through calling one time the `/registration/service` endpoint.

This will create a new Verify Service and return the `SERVICE_SID` that you will need to set in your environment variables.

Inside that function you can modify the parameters of the service creation, like `friendlyName` or `Passkeys.RelyingParty.Name` to customize it to your needs.

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
