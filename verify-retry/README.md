# Twilio Verify with Retry Logic

This demo of the [Twilio Verify API](https://www.twilio.com/docs/verify/api) includes best practices for SMS verification retry logic with Voice fallback and landline detection.

## Pre-requisites

* A Verify Service. [Create one in the Twilio Console](https://www.twilio.com/console/verify/services)

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable             | Meaning                                                           | Required |
| :------------------- | :---------------------------------------------------------------- | :------- |
| `ACCOUNT_SID`        | Find in the [console](https://www.twilio.com/console)             | Yes      |
| `AUTH_TOKEN`         | Find in the [console](https://www.twilio.com/console)             | Yes      |
| `VERIFY_SERVICE_SID` | Create one [here](https://www.twilio.com/console/verify/services) | Yes      |

### Function Parameters

`start-verify.js` expects the following parameters:

| Parameter      | Description                                 | Required |
| :------------- | :------------------------------------------ | :------- |
| `to`           | Either an email or phone number in [E.164 format](https://www.twilio.com/docs/glossary/what-e164) | Yes |
| `channel`      | 'sms' or 'call'. Default is 'sms'           | No |

`check-verify.js` expects the following parameters:

| Parameter           | Description                | Required |
| :------------------ | :------------------------- | :------- |
| `to`                | Either an email or phone number in [E.164 format](https://www.twilio.com/docs/glossary/what-e164) | Yes |
| `code`              | Collected from user input  | Yes      |

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init verify-retry-sample --template=verify-retry && cd verify-retry-sample
```

4. Add your environment variables to `.env`:

Make sure variables are populated in your `.env` file. See [Environment variables](#environment-variables).

5. Start the server :

```
twilio serverless:start
```

5. Open the web page at https://localhost:3000/index.html and enter your phone number to test

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```

