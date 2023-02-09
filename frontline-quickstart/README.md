# Frontline Serverless Quickstart

***NOTE: Effective February 9, 2023***, Twilio Frontline is limited to existing Frontline accounts only. New and existing Twilio customers without previous access to Frontline will not be able to get Frontline through Twilio's Console nor access developer documentation.   For more information, please check out the Twilio [Frontline](https://support.twilio.com/hc/en-us/articles/12427869273627-Twilio-Frontline-Limitation-of-New-Sales-Notice-and-Information) Support documentation.

## What is this?
This is the code that we use for the [Frontline Serverless Quickstart](https://www.twilio.com/docs/frontline/serverless-quickstart). It's intended to be deployed to [Twilio Functions](https://www.twilio.com/docs/runtime/functions), whereit ceates one function for each callback needed to setup Frontline features. 

This is intended to be used as the [Integration Service of a Frontline instance](https://www.twilio.com/docs/frontline/frontline-integration-service).

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. A file named `.env` is used to store the values for those environment variables. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable | Description | Required |
| :------- | :---------- | :------- |
| SSO_USERNAME | SSO SSO_USERNAME of agent to be assigned to Example Customers | Yes |
| EXAMPLE_CUSTOMER_1_PHONE_NUMBER | Phone number to be used on the Example Customer 1 | Yes |
| EXAMPLE_CUSTOMER_2_PHONE_NUMBER | Phone number to be used on the Example Customer 2 | No |
| TWILIO_PHONE_NUMBER | A Twilio phone number to be used as the Sender | Yes |


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

Run the following command while being inside your project folder:

```bash
twilio serverless:deploy
```

Read more:
- [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart)
- [Serverless Toolkit.](https://www.twilio.com/docs/labs/serverless-toolkit)