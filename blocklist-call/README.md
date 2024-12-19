# Twilio Blocklist Call

This function in `blocklist-call.js` allows users to setup a blocklist to reject unwanted phone numbers. See [here](https://support.twilio.com/hc/en-us/articles/360034788313-Reject-Incoming-Calls-with-a-Phone-Number-Blacklist) for a more in-depth guide.

### Environment variables

This Function expects one environment variable to be set.

| Variable    | Meaning                                                                                                                                                                 |
| :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BLOCKLIST` | The comma-separated list of numbers you want to reject [in E.164 format](https://support.twilio.com/hc/en-us/articles/223183008-Formatting-International-Phone-Numbers) |

### Parameters

This Function expects the incoming request to be a [voice webhook](https://www.twilio.com/docs/voice/api/call-resource?code-sample=code-fetch-a-call-resource&code-language=Node.js&code-sdk-version=3.x). The parameters that will be used are `From` and `blocklist`.

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project
```
twilio serverless:init blocklist-call --template=blocklist-call && cd blocklist-call
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

Connect your Twilio phone number to your callback URL:
Replace the phone number with your Twilio Number and the voice-url with your deployed URL. You can also do this in the console settings page for the phone number.

twilio api:core:phone-numbers:update +11111111111 --voice-url https://YOUR_URL_HERE/twil.io/blocklist-call