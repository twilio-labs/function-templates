# Twilio Voice Client JavaScript

This is a collection of functions that can be used to setup a sample environment for use with the Programmable Voice SDKs. These are specifically for use with client side implementations and provides an example web application to explore the Voice Client JavaScript SDK.

## Configuration

Create a TwiML Application.

```bash
twilio api:core:applications:create --friendly-name=voice-client-javascript
```

## Environment variables

This Function expects the following environment variables set:

| Variable     | Meaning                                                                           | Required |
| :----------- | :-------------------------------------------------------------------------------- | :------- |
| `TWIML_APPLICATION_SID` | TwiML Application                                                      | Yes      |
| `API_KEY`    | Twilio API Key                                                                    | Yes      |
| `API_SECRET` | Twilio API Secret corresponding to your API Key                                   | Yes      |
| `CALLER_ID`  | The number you would like your calls to originate from in e.164 format            | Yes      |

## Development

You can run these functions locally using `twilio serverless:start`.

In order to have your TwiML application be able to route calls you must wire up the VoiceUrl to a publicly accessible. We suggest using a tunneling tool like [ngrok](https://ngrok.com/).

Start a tunnel to your local server. The functions are accessible on port 3000.

```bash
ngrok http 3000
```

Now set your `VoiceUrl` on your **TwiML Application** to be your ngrok url

```bash
source .env
twilio api:core:applications:update --sid=$TWIML_APPLICATION_SID --url=https://your-random-ngrok.ngrok.io/client-voice-twiml-app
```

## Parameters

These functions don't expect any parameters passed.
