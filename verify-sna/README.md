# Verify Silent Network Auth Sample Backend

These functions show you how to create and check verification tokens for Twilio Verify using the Silent Network Auth channel.

## How to use the template

The best way to use the Function templates is through the Twilio CLI as described below. If you'd like to use the template without the Twilio CLI, [check out our usage docs](../docs/USING_FUNCTIONS.md).

## Pre-requisites

- [Create a Verify Service](https://www.twilio.com/console/verify/services)
- Set up and run the sample app for [iOS](https://github.com/twilio/twilio-verify-ios)

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable             | Meaning                                                           | Required |
| :------------------- | :---------------------------------------------------------------- | :------- |
| `ACCOUNT_SID`        | Find in the [console](https://www.twilio.com/console)             | Yes      |
| `AUTH_TOKEN`         | Find in the [console](https://www.twilio.com/console)             | Yes      |
| `VERIFY_SERVICE_SID` | Create one [here](https://www.twilio.com/console/verify/services) | Yes      |


### Function Parameters

`verify-start.js` expects the following parameters:

| Parameter      | Description                                 | Required |
| :------------- | :------------------------------------------ | :------- |
| `countryCode`           | A valid country code, including the + sign | Yes |
| `phoneNumber`      | A phone number in [E.164 format](https://www.twilio.com/docs/glossary/what-e164), not including the country code | Yes |

`verify-check.js` expects the following parameters:

| Parameter      | Description                                 | Required |
| :------------- | :------------------------------------------ | :------- |
| `countryCode`           | A valid country code, including the + sign | Yes |
| `phoneNumber`      | A phone number in [E.164 format](https://www.twilio.com/docs/glossary/what-e164), but not including the country code | Yes |


## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init verify-sna-sample --template=verify-sna && cd verify-sna-sample
```

4. Add your environment variables to `.env`:

Make sure variables are populated in your `.env` file. See [Environment variables](#environment-variables).

5. Start the server with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:start
```

6. Open the web page at https://localhost:3000/index.html and click the Fetch Verifications button to start waiting for created/checked verifications from the sample app

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```