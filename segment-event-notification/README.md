# Segment Track Notification

This app sends an SMS to your number when your Segment-enabled website generates a specific tracking event.

## Pre-requisites

### Segment

A Segment account and a Connection that generates `track` events are pre-requisites for using this integration.

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable            | Description                                  | Required |
| :------------------ | :------------------------------------------- | :------- |
| SEGMENT_EVENT       | The event name you want to be notified about | Yes      |
| TWILIO_PHONE_NUMBER | A Twilio phone number                        | Yes      |
| MY_PHONE_NUMBER     | The phone number to notify                   | Yes      |

### Function Parameters

`/track-sms` exposes a webhook that expects a `POST` method whose body should contain a JSON-formatted Segment `track` event.

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=segment && cd example
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

## Segment Configuration

To send Segment `track` events to this function, configure a Connection with a new webhook destination, and the deployed URL of this function as the webhook to send data to.
