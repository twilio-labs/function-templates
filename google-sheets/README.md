# Google Sheets

Logs incoming SMS numbers and messages into a Google Sheets spreadsheet.

## Pre-requisites

To use this function, you will need a Google Sheets spreadsheet you want to log messages into, and a Google Cloud service account and associated authentication key. See the Google documentation on [creating a service account](https://cloud.google.com/iam/docs/creating-managing-service-accounts#creating) and [generating an authentication key](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys) for details. Ensure that your authentication key is in JSON format, and that it is saved to a file named `auth.private.json` under the `assets` directory for this function.

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable           | Description                                                       | Required |
| :----------------- | :---------------------------------------------------------------- | :------- |
| GOOGLE_CREDENTIALS | The path to your Google service account authentication JSON file  | Yes      |
| DOCUMENT_ID        | The document ID for your Google Sheets spreadsheet                | Yes      |
| SHEET_NAME         | The spreadsheet name to log to within your Google Sheets document | Yes      |

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=google-sheets && cd example
```

4. Start the server with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:start
```

5. Open the web page at https://localhost:3000/index.html and follow the instructions to test your application.

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```
