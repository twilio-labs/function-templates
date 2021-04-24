# Volunteer Communication Center

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable          | Description                                        | Required |
| :---------------- | :------------------------------------------------- | :------- |
| `MY_PHONE_NUMBER` | Twilio Number for accepting messages and calls     | Yes      |
| `FLOW_SID`        | SID of Studio Flow                                 | No       |
| `AUTOPILOT_SID`   | SID of trained Autopilot Assistant                 | No       |

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=volunteer-communication-center && cd example
```

4. Start the server with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:start --load-local-env
```

5. Open the web page at https://localhost:3000/index.html and follow the steps to finish the configuration of your app. You will be prompted to deploy the Autopilot Assistant that is pre-trained on data and a Studio Flow that handles the incoming messages and calls and connects to Flex. This studio flow will automatically be associated with the phone number set as the `TWILIO_PHONE_NUMBER` environment variable and the Autopilot and Send to Flex widgets will be configured accordingly. 

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```