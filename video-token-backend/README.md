# video-token-server

This function template will deploy an endpoint that can be used to obtain access tokens for Twilio Video. The endpoint will be secured with a passcode, which is generated when you visit index.html for the deployed URL.

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. A file named `.env` is used to store the values for those environment variables. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable      | Description                                                                       | Required |
| :------------ | :-------------------------------------------------------------------------------- | :------- |
| `ACCOUNT_SID` | Find in the [console](https://www.twilio.com/console)                             | Yes      |
| `API_KEY`     | Twilio API Key. Create one here (https://www.twilio.com/console/runtime/api-keys) | Yes      |
| `API_SECRET`  | Twilio API Secret corresponding to your API Key                                   | Yes      |


### Function Parameters

`/token` expects the following parameters:

| Parameter   | Description                                                        | Required |
| :---------- | :----------------------------------------------------------------- | :------- |
| `identity`  | The identity of the user that is connecting to a Twilio Video room | yes      |
| `room_name` | The name of the Twilio Video room to connect to                    | yes      |
| `passcode`  | The passcode for the Token Server                                  | yes      |


## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=video-token-server && cd example
```

4. Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```
