# SMS Notifications

Send SMS messages from the browser

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable              | Description                                              | Required |
| :-------------------- | :------------------------------------------------------- | :------- |
| `TWILIO_PHONE_NUMBER` | The Twilio phone number to broadcast your messages from. | Yes      |
| `PASSCODE`            | A passcode to avoid anyone sending text messages         | Yes      |

### Function Parameters

`/send-messages` gets invoked by the `index.html` page and expects three post parameters:

| Parameter    | Description                                                                   | Required |
| :----------- | :---------------------------------------------------------------------------- | :------- |
| `passcode`   | The passcode to compare against the stored passcode                           | Yes      |
| `message`    | The message you want to broadcast                                             | Yes      |
| `recipients` | A comma seprated list of E.164 formatted phone numbers to send the message to | Yes      |

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=sms-notifications && cd example
```

4. Start the server with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:start
```

5. Open the web page at https://localhost:3000/index.html and enter your phone number, passcode and a message to test your app.

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```
