# SMS Notifications

Send SMS messages from the browser

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable              | Description                                              | Required |
| :-------------------- | :------------------------------------------------------- | :------- |
| `TWILIO_PHONE_NUMBER` | The Twilio phone number to broadcast your messages from. | Yes      |
| `AUTH_USERNAME`       | Username for Authentication. Defaults to 'admin'         | Yes      |
| `AUTH_PASSCODE`       | A passcode to avoid anyone sending text messages         | Yes      |

Additional Testing environment variables are required for Testing and use of [Magic Number](https://www.twilio.com/blog/2018/04/twilio-test-credentials-magic-numbers.html)

| Variable              | Description                                              | Required |
| :-------------------- | :------------------------------------------------------- | :------- |
| `TESTMODE`            | Is this application running in Test Mode                 | Yes      |
| `TEST_ACCOUNT_SID`    | Test Credential SID from [here](https://www.twilio.com/console/project/settings) | Yes if in Testmode |
| `TEST_AUTH_TOKEN`     | Test Credential Auth Token from [here](https://www.twilio.com/console/project/settings) | Yes if in Testmode |

### Function Parameters

`/send-messages` gets invoked by the `index.html` page and expects three post parameters:

| Parameter    | Description                                                                   | Required |
| :----------- | :---------------------------------------------------------------------------- | :------- |
| `message`    | The message you want to broadcast                                             | Yes      |
| `recipients` | An array of E.164 formatted phone numbers and parameters to send the message  | Yes      |

`recipients` is an array of JSON object in the following format
```
[ 
  {number: '+61412345678', parameters: ['param1', 'param2']},
  {number: '+61499999999', parameters: ['param1', 'param2']},
  {number: '+61455555555', parameters: ['param1', 'param2']},
]
```

| Header          | Description                                                                | Required |
| :-------------- | :------------------------------------------------------------------------- | :------- |
| `Authorization` | Basic Auth using `AUTH_USERNAME` and `AUTH_PASSCODE`                       | Yes      |



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

## License

This project is licensed under the MIT License - see the [LICENSE.md](license.md) file for details