# JSON Webhook Adapter

Forward a URL encoded Twilio webhook event to a JSON webhook, suitable for use with services like Zapier and IFTTT.

## Pre-requisites

Generally, this function template needs the URL for a publicly accessible webhook that can receive Twilio event data in a JSON format.

### Zapier

To push data to Zapier, you will need a [Zapier](https://zapier.com) account and
a Zap with a [Catch Hook webhook trigger](https://zapier.com/help/create/code-webhooks/trigger-zaps-from-webhooks).

### IFTTT

To push data to IFFF, use an [IFTTT Maker Webhook](https://ifttt.com/maker_webhooks) as a trigger for an action. The URL for your webhook will be available in the documentation page for IFTTT Maker Webhooks. By default, this function template exposes SMS SIDs, phone numbers, and text content to IFTTT.

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable    | Description                                               | Required |
| :---------- | :-------------------------------------------------------- | :------- |
| WEBHOOK_URL | The URL for the webhook your function should push data to | Yes      |

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=json-webhook && cd example
```

4. Start the server with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:start
```

5. Open the web page at https://localhost:3000/index.html and follow the
   instructions to test your application.

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```
