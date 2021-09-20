# sms-subscription

Allow people to subscribe for notifications and then notify everyone at once.

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. A file named `.env` is used to store the values for those environment variables. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable | Description | Required |
| :------- | :---------- | :------- |
| `TWILIO_PHONE_NUMBER` | The Twilio phone number to send broadcast SMS from | true |
| `PASSCODE` | Choose a passcode for your app. Users have to use this passcode to send SMS broadcasts or delete all subscriptions | true |
| `SYNC_SERVICE_SID` | SID for the Sync Service that is used to store the subscriptions. Can be left empty for default service. | false |


### Function Parameters

`/subscribe` expects the following parameters:

| Parameter | Description | Required |
| :-------- | :---------- | :------- |
| `phoneNumber` | The number to add to the subscription | true |


`/notify` is requires to authenticate with basic auth using the configured `PASSCODE` as password and the username `admin`. It supports the following parameters:

| Parameter | Description | Required |
| :-------- | :---------- | :------- |


`/delete-subscriptions` is requires to authenticate with basic auth using the configured `PASSCODE` as password and the username `admin`. It supports the following parameters:

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
twilio serverless:init example --template=sms-subscription && cd example
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
