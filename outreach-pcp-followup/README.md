# outreach-pcp-followup

Enables Patient Outreach Followup for PCP

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable | Description | Required |
| :------- | :---------- | :------- |
|APPLICATION_CUSTOMER_NAME|Customer name to be displayed in SMS|Y|
|APPLICATION_CUSTOMER_CODE|Customer short name. Must be all lowercase one word without any spaces|Y|
|TWILIO_PHONE_NUMBER|Twilio phone number to send SMS from. Your patient will see this number.|Y|
|AWS_DEPLOYER_AWS_ACCESS_KEY_ID|AWS access key id to your AWS account with admin-level privilege|Y|
|AWS_DEPLOYER_AWS_SECRET_ACCESS_KEY|AWS secret access key of your AWS access key id|Y|
|AWS_REGION|description: AWS region to deploy resources|Y|


### Function Parameters

`/save-response` expects the following parameters:

| Parameter | Description | Required |
| :-------- | :---------- | :------- |
|patient    | flow.data that will be parenthesis enclosed comma-separated key=value string. Note that values will not be enclosed in quotes. (eg., {k1=v1, k2=v2, k3=v3} )|Y|
|question_id|short alphanumeric ID for question|Y|
|response   |response text to question|Y|
|question   |full question text|N|


## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=outreach-pcp-followup && cd example
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
