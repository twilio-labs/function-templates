# vaccine-standby-list

Allows for the creation of a list of residents who want to be notified when it’s their turn to get the vaccine, who self-report demographic data that can be used by health agencies to prioritize the rollout in accordance with CDC guidelines.

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable              | Description | Required |
| :-------------------- | :----------------------------------------------------- | :-- |
| `MY_PHONE_NUMBER`     | Your Twilio phone number for sending and receiving SMS | Yes |
| `AIRTABLE_API_KEY`    | Your Airtable API key                                  | Yes |
| `AIRTABLE_BASE_ID`    | The Airtable Base ID. Base should be copied from the [vaccine standby list template](https://airtable.com/universe/expeJaAHwR6NK9al0/covid-19-vaccine-standby-list) on Airtable Universe | Yes |
| `AIRTABLE_EMBED_CODE` | Full HTML string of embed code of your Airtable base   | Yes |



### Function Parameters

`/blank` expects the following parameters:

| Parameter | Description | Required |
| :-------- | :---------- | :------- |


`/hello-messaging` is protected and requires a valid Twilio signature as well as the following parameters:

| Parameter | Description | Required |
| :-------- | :---------- | :------- |


## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=vaccine-standby-list && cd example
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
