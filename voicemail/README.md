# Voicemail

This Function will forward incoming calls to another number during business hours (by default Monday to Friday 8:00-18:59 UTC) and will otherwise direct to a voicemail. The voicemail will record a message and send a link of the recording via SMS to the configured phone number.

## How to use the template

The best way to use the Function templates is through the Twilio CLI as described below. If you'd like to use the template without the Twilio CLI, [check out our usage docs](../docs/USING_FUNCTIONS.md).

## Pre-requisites

- A Twilio account - [sign up here](https://www.twilio.com/try-twilio)
- A Twilio phone number

### Environment variables

To deploy this project with the Functions API, this Function expects the following environment variables set in your `.env` file:

| Variable          | Meaning                                                                                                        | Required |
| :---------------- | :------------------------------------------------------------------------------------------------------------- | :------- |
| `MY_PHONE_NUMBER` | The phone number that you want calls to be forwarded to and that should receive the SMS for voicemail messages | yes      |
| `TIMEZONE_OFFSET` | Offset from the UTC timezone to determine whether a call is happening during business hours                    | no       |
| `WORK_WEEK_START` | Day of the week where the business hours should start applying. 0-6 = Sunday - Saturday. 1 = Monday            | no       |
| `WORK_WEEK_END`   | Day of the week after which the business hours should stop applying. 0-6 = Sunday - Saturday. 5 = Friday       | no       |
| `WORK_HOUR_START` | Hour of the day where business hours should start. 0-23. 8 = 8:00:00 = 8:00:00AM                               | no       |
| `WORK_HOUR_END`   | Hour of the day where business hours should stop. 0-23. 18 = 18:59:59 = 6:59:59PM                              | no       |

Additionally, you'll have to have your `ACCOUNT_SID` and `AUTH_TOKEN` set.

### Function Parameters

This template by default accepts no additional parameters.

## Create a new project with the template

1. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)
2. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
3. Initiate a new project

```
twilio serverless:init sample --template=voicemail && cd sample
```

4. Start the server with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:start --ngrok
```

5. Set your incoming call webhook URL for the phone number you want to configure to `https://<your-ngrok-code>.ngrok.io/voicemail`

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

## Deploying

Deploy your functions and assets with the following command. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```

Make sure to update your incoming voice URL to your newly deployed Function URL.
