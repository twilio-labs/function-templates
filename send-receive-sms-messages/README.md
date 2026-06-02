# send-receive-sms-messages

Demonstrates how to send & receive SMS messages with Twilio

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. A file named `.env` is used to store the values for those environment variables. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable | Description | Required |
| :------- | :---------- | :------- |
| TWILIO_AUTH_TOKEN | This is your Twilio Auth Token. Available from the Account Dashboard of the Twilio Console. | Yes |
| TWILIO_ACCOUNT_SID | This is your Twilio Account SID. Available from the Account Dashboard of the Twilio Console. | YES |
| TWILIO_PHONE_NUMBER | This is your Twilio Phone Number. It's the number which the SMS will be sent from | YES |
| RECIPIENT | This is a mobile/cell number that you can receive SMS on. | YES |

### Function Parameters

`/blank` expects the following parameters:

| Parameter | Description | Required |
| :-------- | :---------- | :------- |

`/send-receive-sms` is protected and requires a valid Twilio signature as well as the following parameters:

| Parameter | Description | Required |
| :-------- | :---------- | :------- |

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=send-receive-sms-messages && cd example
```

4. Start the server with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:start
```

5. Open the web page at <https://localhost:3000/index.html> and enter your phone number to test

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```
