# Frontline Functions Quickstart

Creates 1 function for each callback needed to setup Frontline features. 

This is intended to be used as the Integration Service of a Frontline instance.

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. A file named `.env` is used to store the values for those environment variables. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable | Description | Required |
| :------- | :---------- | :------- |
| WORKER_USERNAME | SSO username of agent to be assigned to Example Customer | Yes |
| PHONE_NUMBER_FOR_CUSTOMER_1 | Phone number to be used on the Example Customer 1 | Yes |
| NAME_FOR_CUSTOMER_1 | Display name for Example Customer 1 | Yes |
| PHONE_NUMBER_FOR_CUSTOMER_2 | Phone number to be used on the Example Customer 2 | No |
| NAME_FOR_CUSTOMER_2 | Display name for Example Customer 2 | No |
| TWILIO_PHONE_NUMBER | A Twilio phone number to be used as the Sender | Yes |
| TWILIO_WHATSAPP_NUMBER | A Whatsapp enabled phone number | No |


## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=frontline-quickstart && cd example
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
