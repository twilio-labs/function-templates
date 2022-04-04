# Twilio Verify Push Sample Backend for the Authy app (Pilot)

This project can be used as a sample backend for [Verify Push](https://www.twilio.com/docs/verify/push) and to issue push authentication challenges in combination with the [Authy Android App](https://play.google.com/store/apps/details?id=com.authy.authy), [Authy iOS App](https://apps.apple.com/us/app/twilio-authy/id494168017) or [Authy Desktop app](https://authy.com/download/)

## How to use the template

The best way to use the Function templates is through the Twilio CLI as described below. If you'd like to use the template without the Twilio CLI, [check out our usage docs](../docs/USING_FUNCTIONS.md).

## Pre-requisites

- [Create a Verify Service](https://www.twilio.com/console/verify/services)
- Install the pilot version

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable             | Meaning                                                           | Required |
| :------------------- | :---------------------------------------------------------------- | :------- |
| `ACCOUNT_SID`        | Find in the [console](https://www.twilio.com/console)             | Yes      |
| `AUTH_TOKEN`         | Find in the [console](https://www.twilio.com/console)             | Yes      |
| `VERIFY_SERVICE_SID` | Create one [here](https://www.twilio.com/console/verify/services) | Yes      |

### Function Parameters

`generate-qr-code.js` expects the following parameters:

| Parameter      | Description                                   | Required |
| :------------- | :-------------------------------------------- | :------- |
| `identity`                 | Unique user ID, avoid PII         | Yes |
| `factor friendly name`     | Factor friendly name              | No |

`list-factors.js` expects the following parameters:

| Parameter      | Description                                 | Required |
| :------------- | :------------------------------------------ | :------- |
| `identity`     | Unique user ID, avoid PII                   | Yes |

`create-challenge.js` expects the following parameters:

| Parameter           | Description                | Required |
| :------------------ | :------------------------- | :------- |
| `identity`          | Unique user ID, avoid PII  | Yes |
| `factor`            | Factor SID                 | Yes |
| `message`           | Verification message       | Yes |
| details             | Arbitrary key value pairs to demo additional verification context | Yes |

`challenge-status.js` expects the following parameters:

| Parameter           | Description                | Required |
| :------------------ | :------------------------- | :------- |
| `identity`          | Unique user ID, avoid PII  | Yes |
| `sid`               | Challenge SID              | Yes |


## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init verify-push-authy-backend --template=verify-push-authy-backend && cd verify-push-authy-backend
```

4. Add your environment variables to `.env`:

Make sure variables are populated in your `.env` file. See [Environment variables](#environment-variables).

5. Start the server :

```
twilio serverless:start
```

5. Open the web page at https://localhost:3000/index.html and enter the required fields to send a challenge

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.


## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```
