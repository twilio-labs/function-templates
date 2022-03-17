# Phone number lookup

This project will show you how to look up a phone number to get different types of information including:

1. Validation and Formatting. Detects invalid phone numbers and parses numbers into the [standardized E.164 format]((https://www.twilio.com/docs/glossary/what-e164))
2. Carrier. Detects line type (i.e. mobile, landline, voip) and carrier.
3. Caller name. Subscriber info, US only.

More details in the [Lookup API documentation](https://www.twilio.com/docs/lookup/api).

For a production use case we recommend adding [phone verification](https://github.com/twilio-labs/function-templates/tree/main/verify), which is a best practice for collecting phone numbers from your users in order to make sure they have control of the number.

## How to use the template

The best way to use the Function templates is through the Twilio CLI as described below. If you'd like to use the template without the Twilio CLI, [check out our usage docs](../docs/USING_FUNCTIONS.md).

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable             | Meaning                                                           | Required |
| :------------------- | :---------------------------------------------------------------- | :------- |
| `ACCOUNT_SID`        | Find in the [console](https://www.twilio.com/console)             | Yes      |
| `AUTH_TOKEN`         | Find in the [console](https://www.twilio.com/console)             | Yes      |

### Function Parameters

`lookup.js` expects the following parameters:

| Parameter      | Description                                 | Required |
| :------------- | :------------------------------------------ | :------- |
| `phone`        | Phone number in [E.164 format](https://www.twilio.com/docs/glossary/what-e164) | Yes |
| `types`        | Optional. Can provide 'carrier' and 'caller-name' for additional details, defaults to formatting lookup. | No |


## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init lookup-sample --template=lookup && cd lookup-sample
```

4. Add your environment variables to `.env`:

Make sure variables are populated in your `.env` file. See [Environment variables](#environment-variables).

5. Start the server :

```
npm start
```

5. Open the web page at https://localhost:3000/index.html and enter your phone number to test

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```