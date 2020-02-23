# Twilio Verify

These function show you how to send and check verification tokens for [Twilio Verify](https://www.twilio.com/docs/verify/api). More details about how to work with Verify and Twilio functions can be found in [this blog post](https://www.twilio.com/blog/serverless-phone-verification).

![phone-verification-gif](https://github.com/robinske/serverless-phone-verification/blob/master/phone-verification.gif?raw=true)

## Pre-requisites

- [Create a Verify Service](https://www.twilio.com/console/verify/services)
- Add `VERIFY_SERVICE_SID` from above to your [Environment Variables](https://www.twilio.com/console/functions/configure)
- Enable `ACCOUNT_SID` and `AUTH_TOKEN` in your [functions configuration](https://www.twilio.com/console/functions/configure)

### Environment variables

To deploy this project with the Functions API, this Function expects the following environment variables set in your `.env` file. To keep your ids and secrets secure, the `.env` file is not tracked in git. To create your `.env` file locally run

```shell
cp .env.example .env
```

In your newly created `.env` file set the values below:

| Variable             | Meaning                                                           | Required |
| :------------------- | :---------------------------------------------------------------- | :------- |
| `ACCOUNT_SID`        | Find in the [console](https://www.twilio.com/console)             | Yes      |
| `AUTH_TOKEN`         | Find in the [console](https://www.twilio.com/console)             | Yes      |
| `VERIFY_SERVICE_SID` | Create one [here](https://www.twilio.com/console/verify/services) | Yes      |

### Function Parameters

`start-verify.js` expects the following parameters:

| Parameter      | Description                                                       | Required |
| :------------- | :---------------------------------------------------------------- | :------- |
| `phone_number` | In [E.164 format](https://www.twilio.com/docs/glossary/what-e164) | Yes      |
| `channel`      | 'sms' or 'call'. Default is 'sms'                                 | No       |

`check-verify.js` expects the following parameters:

| Parameter           | Description                                                       | Required |
| :------------------ | :---------------------------------------------------------------- | :------- |
| `phone_number`      | In [E.164 format](https://www.twilio.com/docs/glossary/what-e164) | Yes      |
| `verification_code` | Collect from user                                                 | Yes      |

## Create a new project with the template

1. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)
2. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
3. Initiate a new project

```
twilio serverless:init verify-sample --template=verify && cd verify-sample
```

4. Start the server with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

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
