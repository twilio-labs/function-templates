# Forward Call

This application forwards an incoming call to a number set in the environment variables.

## Pre-requisites

- A [Twilio account](https://www.twilio.com/try-twilio) with an active phone number that can receive calls

### Environment variables

`.env` is included with placeholder values. Update `MY_PHONE_NUMBER` before running. Never commit `.env`.

| Variable | Description | Required |
| :- | :- | :- |
| `MY_PHONE_NUMBER` | The number to forward incoming calls to [in E.164 format](https://support.twilio.com/hc/en-us/articles/223183008-Formatting-International-Phone-Numbers) | Yes |
| `TWILIO_VOICE_WEBHOOK_URL` | The webhook path — pre-set to `/forward-call`, do not change | Yes |

## Running the project

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
1. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

1. Initialize the project from the template

```shell
twilio serverless:init example --template=forward-call --skip-credentials && cd example
```

1. Edit `.env` and replace the placeholder `MY_PHONE_NUMBER` with your real E.164 number

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

Then update the voice webhook:

```shell
twilio api:core:incoming-phone-numbers:update \
  --sid <your-phone-number-sid> \
  --voice-url https://<your-ngrok-id>.ngrok.app/forward-call \
  --voice-method POST
```

**Via Console:**

1. Go to your [Twilio Console Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Select the phone number you want to use
3. Under "Voice Configuration":
   - Set "A Call Comes In" to **Webhook**
   - Enter your URL: `https://<your-ngrok-id>.ngrok.app/forward-call` (or your deployed URL)
   - Set HTTP method to **POST**
4. Click **Save**

## Deploying

Deploy your functions and assets with the following command. Note: you must run these commands from inside your project folder. [More information about the serverless toolkit in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```shell
twilio serverless:deploy --service-name forward-call
```
