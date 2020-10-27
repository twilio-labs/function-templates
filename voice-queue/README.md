# Voice Queue

A simple call queuing system. Place the inbound caller into a queue with hold music while waiting for the intended recipient to answer.

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable              | Description                                          | Required |
| :-------------------- | :--------------------------------------------------- | :------- |
| `HOLD_MUSIC_URL`      | The URL for the hold music you want to play.         | true     |
| `YOUR_PHONE_NUMBER`   | Your personal number to forward the inbound call to. | true     |
| `TWILIO_PHONE_NUMBER` | The Twilio number used to forward the call.          | true     |

### Function Parameters

`/dial-queue` expects the following parameters:

| Parameter | Description                                                     | Required |
| :-------- | :-------------------------------------------------------------- | :------- |
| `CallSid` | Use the inbound CallSid as the unique identifier for the Queue. | true     |
| `From`    | Whisper who is calling to the intended recipient.               | true     |

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=voice-queue && cd voice-queue
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
