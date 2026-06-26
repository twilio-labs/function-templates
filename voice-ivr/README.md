# Voice IVR

This application implements a phone tree (IVR) using Twilio Voice and Programmable SMS. When a caller dials your Twilio number they hear three options — Talk to Sales, Hours of Operation, or Address — and can select one by pressing a digit or speaking the option name. Sales calls are forwarded to a configurable phone number, hours are read back via text-to-speech, and the address is delivered as an SMS to the caller.

**For AI coding assistants:** See [AGENTS.md](./AGENTS.md) for setup and implementation guidelines.

## Prerequisites

- An [ngrok](https://ngrok.com) account
- A [Twilio account](https://www.twilio.com/try-twilio) with an active phone number that can send SMS

## Environment variables

This project requires some environment variables to be set. To keep any tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

Set the following values in `.env`:

| Variable          | Meaning                                                  | Required |
| :---------------- | :------------------------------------------------------- | :------- |
| `TWILIO_PHONE_NUMBER` | The "Sales" phone number that you want calls to be forwarded to. | yes      |

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=voice-ivr && cd example
```

4. Start the server with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:start
```

> **Tip**: Run `npm test` from the repository root to run tests. Other available commands: `npm run lint`, `npm run format`.

5. Open the web page at https://localhost:3000/index.html and follow the instructions to test your application.

Check the developer console and terminal for any errors, and make sure you've set your environment variables.

## Local Development & Testing

### Exposing your local server

To test with a real Twilio phone number, you need to expose your local server to the internet. You can use [ngrok](https://ngrok.com):

```bash
ngrok http 3000
```
Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### Configuring your Twilio phone number

1. Go to your [Twilio Console Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Select the phone number you want to use
3. Under "Voice Configuration":
   - Set "A Call Comes In" to **Webhook**
   - Enter your public URL: `https://your-ngrok-url.ngrok.io/voice-ivr` (or your deployed URL)
   - Set HTTP method to **POST**
4. Click **Save**


You can also use the Twilio CLI to configure your phone number's Voice URL.

First, retrieve the phone number's SID (starts with `PN`):

```bash
twilio phone-numbers:list
```

Using the phone number SID and ngrok URL that you copied above:

```bash
twilio phone-numbers:update YOUR_PHONE_NUMBER_SID --voice-url="https://abc123.ngrok.io"
```

Now when you call your Twilio number, it will trigger the `/voice-ivr` function.

## Deploying

Deploy your functions and assets with the following command. Note: you must run these commands from inside your project folder. [More information about the serverless toolkit in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```
