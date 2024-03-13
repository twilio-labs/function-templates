# passkeys-backend

Verify enables developers to easily add Passkeys into their existing authentication flows, similar to Verify TOTP and Push. The Verify API supports passkey registration, public key storage, and auth flows. On the client-side, developers can optionally embed an open-source library (SDK) that handles interactions with operating systems and customizable UI widgets that maximize conversion.

## How to use the template

The best way to use the Function templates is through the Twilio CLI as described below. If you'd like to use the template without the Twilio CLI, [check out our usage docs](../docs/USING_FUNCTIONS.md).

Make sure befores you use the template you have to set up your enviroment variables and 
customize the associated files with your client applications origins you can find this 
customization [here](#service-customization).

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. A file named `.env` is used to store the values for those environment variables. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

You can find a `.env.example` file to copy for creating your own `.env` file

In your `.env` file, set the following values:

| Variable | Description | Required |
| :------- | :---------- | :------- |
| API_URL | Passkeys API to point at | yes |
| SERVICE_SID | Service used to call twilio services | yes |
| RELYING_PARTY | Customer app or client | yes
| ACCOUNT_SID | Twilio account where the service belong | yes |
| AUTH_TOKEN | Authentication token for twilio account | yes |

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


### Function Parameters

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
| clientDataJson | A base64url encoded object given by the `AuthenticatorAttestationResponse` | yes |
| transports | An Array with the transport methods given by the `AuthenticatorAttestationResponse` | yes |


`/authentication/start` a GET request, does not expect parameters

`/authentication/verification` expects the following parameters:

| Parameter | Description | Required |
| :-------- | :---------- | :------- |
| id | A base64url encoded representation of `rawId`. | yes |
| rawId | The globally unique identifier for this `PublicKeyCredential`. | yes |
| authenticatorData | A base64url encoded object given by the `AuthenticatorAttestationResponse` | yes |
| clientDataJson | A base64url encoded object given by the `AuthenticatorAttestationResponse` | yes |
| signature | A base64url encoded object given by the `AuthenticatorAttestationResponse` | yes |
| userHandle | A base64url encoded object given by the `AuthenticatorAttestationResponse` | yes |

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```
