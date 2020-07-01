# personal-voicemail

Provides a simple voice mailbox with SMS notifications and a block list. After callers leave a message you'll be sent a link to the recording via SMS.

An optional block list allows you to manually add phone numbers that you'd like to reject. Rejected callers are not allowed to leave messages.

## Pre-requisites

### Functions Configuration (Twilio Console)

This function requires that you have the "Enable ACCOUNT_SID and AUTH_TOKEN" preference set in your [Functions Settings](https://www.twilio.com/console/functions/configure).

### Function Parameters

`/personal-voicemail` expects the following parameters as defined in the function source:

| Parameter | Description | Required |
| :-------- | :---------- | :------- |
| `phoneNumber` | The phone number to which you'd like to forward incoming calls, formatted in E164. | yes |
| `timeout` | The dial timeout. This is the amount of time that the function will allow your phone to ring before forwarding to voicemail. Default: 12 | yes |
| `secureRecordingLinks` | By default recording urls link directly to the stored message. If you have enabled authentication on your media urls then your voicemail notifications will receive a link to recordings via the Twilio Console. Default: true | yes |
| `voiceOpts` | Control the voice and language preference for the voice prompts. See the docs for details: https://www.twilio.com/docs/voice/twiml/say#attributes-voice | yes |
| `voiceMailMessage` | Control the prompt for callers to leave you a message. Optionally this can be a full url to a recording that will be played instead of using text to speech. | yes |
| `reject` | A list of E164 formatted phone numbers that will be rejected. Calls from these numbers will not be forwarded or allowed to leave a message. | yes |
| `rejectMessage` | Control the prompt to rejected callers. Setting this value to `false` will hang up on blocked callers without informing them that they've been rejected. | yes |


## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=personal-voicemail && cd personal-voicemail
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
