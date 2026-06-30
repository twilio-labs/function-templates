# Forward Message

This application forwards an incoming SMS message to a single number or each number in a comma-separated list set in the environment variables. The forwarded message includes the original sender's number and message body in the format: `From: <number>. Body: <message>`.

## Pre-requisites

- A [Twilio account](https://www.twilio.com/try-twilio) with an active phone number that can receive SMS

### Environment variables

`.env` is included with placeholder values. Update `FORWARDING_NUMBERS` before running. Never commit `.env`.

| Variable | Description | Required |
| :- | :- | :- |
| `FORWARDING_NUMBERS` | A list of numbers [in E.164 format](https://support.twilio.com/hc/en-us/articles/223183008-Formatting-International-Phone-Numbers) to forward incoming messages to, separated by commas | Yes |
| `TWILIO_SMS_WEBHOOK_URL` | The webhook path — pre-set to `/forward-message`, do not change | Yes |

## Running the project

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
1. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

1. Initialize the project from the template

```shell
twilio serverless:init example --template=forward-message --skip-credentials && cd example
```

1. Edit `.env` and replace the placeholder `FORWARDING_NUMBERS` with your real E.164 number(s)

1. Start the server

```shell
twilio serverless:start
```

Check the developer console and terminal for any errors, and make sure you've set your environment variables.

### Configuring your Twilio phone number

You can configure the webhook via the Twilio CLI (recommended) or the Console.

**Via CLI:**

Find your phone number SID:

```shell
twilio api:core:incoming-phone-numbers:list
```

Then update the SMS webhook:

```shell
twilio api:core:incoming-phone-numbers:update \
  --sid <your-phone-number-sid> \
  --sms-url https://<your-ngrok-id>.ngrok.app/forward-message \
  --sms-method POST
```

**Via Console:**

1. Go to your [Twilio Console Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Select the phone number you want to use
3. Under "Messaging Configuration":
   - Set "A Message Comes In" to **Webhook**
   - Enter your URL: `https://<your-ngrok-id>.ngrok.app/forward-message` (or your deployed URL)
   - Set HTTP method to **POST**
4. Click **Save**

## Deploying

Deploy your functions and assets with the following command. Note: you must run these commands from inside your project folder. [More information about the serverless toolkit in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```shell
twilio serverless:deploy --service-name forward-message
```
