# passkey-backend

Connect appliactions with the passkey service

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. A file named `.env` is used to store the values for those environment variables. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

You can find a `.env.example` file to copy for creating your own `.env` file

In your `.env` file, set the following values:

| Variable | Description | Required |
| :------- | :---------- | :------- |
| API_URL | Passkey API to point at | yes |
| SERVICE_SID | Service used to call twilio services | yes |
| RELYING_PARTY | Customer app or client | yes
| ACCOUNT_SID | Twilio account where the service belong | yes |
| AUTH_TOKEN | Authentication token for twilio account | yes |


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
| type | `public-key` | yes |
| attestationObject | A base64url encoded object given by the `AuthenticatorAttestationResponse` | yes |
| clientDataJson | A base64url encoded object given by the `AuthenticatorAttestationResponse` | yes |
| transports | An Array with the transport methods given by the `AuthenticatorAttestationResponse` | yes |


`/authentication/start` a GET request, does not expect parameters

`/registration/verification` expects the following parameters:

| Parameter | Description | Required |
| :-------- | :---------- | :------- |
| id | A base64url encoded representation of `rawId`. | yes |
| rawId | The globally unique identifier for this `PublicKeyCredential`. | yes |
| type | `public-key` | yes |
| authenticatorData | A base64url encoded object given by the `AuthenticatorAttestationResponse` | yes |
| clientDataJson | A base64url encoded object given by the `AuthenticatorAttestationResponse` | yes |
| signature | A base64url encoded object given by the `AuthenticatorAttestationResponse` | yes |
| userHandle | A base64url encoded object given by the `AuthenticatorAttestationResponse` | yes |

## Test this project locally

Follow the steps in the [Twilio CLI Test](https://github.com/AuthyApps/twilio-cli-test) repository
