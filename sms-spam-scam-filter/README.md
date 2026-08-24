# SMS Spam and Scam Filter

This application filters inbound SMS messages before they reach your downstream webhook. Incoming messages are classified with OpenAI as either `spam_scam` or `genuine`. Spam and scam messages are ignored with an empty TwiML response. Genuine messages are redirected to your webhook with TwiML `<Redirect>`.

## Pre-requisites

- A [Twilio account](https://www.twilio.com/try-twilio) with an active phone number that can receive SMS
- An OpenAI API key
- A webhook URL that should receive genuine inbound SMS requests

### Environment variables

`.env` is included with placeholder values. Update the values before running. Never commit real secrets in `.env`.

| Variable | Description | Required |
| :------- | :---------- | :------- |
| `OPENAI_API_KEY` | API key used to call OpenAI for SMS spam and scam classification | Yes |
| `OPENAI_MODEL` | OpenAI model used for SMS classification. Defaults to `gpt-5.6-luna` | No |
| `FORWARD_WEBHOOK_URL` | Webhook URL that should receive inbound SMS requests classified as genuine | Yes |
| `FORWARD_WEBHOOK_METHOD` | HTTP method used when redirecting genuine SMS requests. Defaults to `POST` | No |
| `OPENAI_TIMEOUT_MS` | Timeout in milliseconds for OpenAI classification requests. Defaults to `7000` | No |
| `TWILIO_SMS_WEBHOOK_URL` | The webhook path — pre-set to `/sms-spam-scam-filter`, do not change | Yes |

## Running the project

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
1. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

1. Initialize the project from the template

```shell
twilio serverless:init example --template=sms-spam-scam-filter --skip-credentials && cd example
```

1. Edit `.env` and set `OPENAI_API_KEY` and `FORWARD_WEBHOOK_URL`
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
  --sms-url https://<your-ngrok-id>.ngrok.app/sms-spam-scam-filter \
  --sms-method POST
```

**Via Console:**

1. Go to your [Twilio Console Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Select the phone number you want to use
3. Under "Messaging Configuration":
   - Set "A Message Comes In" to **Webhook**
   - Enter your URL: `https://<your-ngrok-id>.ngrok.app/sms-spam-scam-filter` (or your deployed URL)
   - Set HTTP method to **POST**
4. Click **Save**

## Cost estimate

This estimate covers only the OpenAI classification request. It does not include Twilio messaging, carrier, phone number, or webhook hosting costs.

Using `gpt-5.6-luna` pricing of `$0.20` per 1M input tokens and `$1.20` per 1M output tokens, a typical one-segment SMS classification costs about `$0.0001` per checked message.

## Deploying

Deploy your functions and assets with the following command. Note: you must run this command from inside your project folder. [More information about the serverless toolkit is available in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```shell
twilio serverless:deploy --service-name sms-spam-scam-filter
```
