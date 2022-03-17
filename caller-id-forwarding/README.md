# Caller ID with Call Forwarding

This Function in `forward-call.js` will complete 3 steps:

1. Look up the incoming call number using the [Twilio Lookup API](https://www.twilio.com/docs/lookup/api)
1. Send an SMS to the forwarding number with Caller ID information
1. Forward the incoming call to a number that is set in the environment variables.

**Note: `caller-name` lookup is currently only available in the US.**

### Environment variables

This Function expects one environment variable to be set.

| Variable          | Meaning                                                                                                                                                              |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MY_PHONE_NUMBER` | The number you want to forward incoming messages to [in E.164 format](https://support.twilio.com/hc/en-us/articles/223183008-Formatting-International-Phone-Numbers) |

### Parameters

This Function expects the incoming request to be a [voice webhook](https://www.twilio.com/docs/voice/api/call-resource?code-sample=code-fetch-a-call-resource&code-language=Node.js&code-sdk-version=3.x). The parameter used is `From`.

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init caller-id-forwarding --template=caller-id-forwarding
cd caller-id-forwarding
```

4. Add your environment variables to `.env`:

Make sure variables are populated in your `.env` file. See [Environment variables](#environment-variables).

5. Deploy

Deploy your functions and assets with the following commands. Note: you must run the command from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```

6. Connect your Twilio phone number to your callback URL:

Replace the phone number with your Twilio Number and the `voice-url` with your deployed URL. You can also do this in the console settings page for the phone number.

```
twilio api:core:phone-numbers:update +11111111111 --voice-url https://YOUR_URL_HERE/twil.io/forward-call
```

