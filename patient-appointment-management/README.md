# patient-appointment-management

Manages patient appointment reminders

## Pre-requisites

- Twilio Account
- AWS Account with credentials to an admin-level IAM user
  for deploying AWS resources

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable | Description | Required |
| :------- | :---------- | :------- |


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
twilio serverless:init example --template=patient-appointment-management && cd example
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

## Developer Notes

### Undeploying

Requires [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
and [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)
and `env.local` file for running the server locally.

1. Start the server locally:
```
twilio serverless:start --env=env.local
```

2. Undeploy AWS Application.
   Check in [AWS CloudFormation console](https://console.aws.amazon.com/cloudformation/)
   that the Stack has been removed.
   Alternatively, you can manually delete the stack via AWS Console:
```
curl "http://localhost:3000/deployment/deploy-aws-application?action=DELETE"
```

3. Undeploy AWS Bucket.
   Check in [AWS CloudFormation console](https://console.aws.amazon.com/cloudformation/)
   that the Stack has been removed.
   Alternatively, you can manually delete the stack via AWS Console:
```
curl "http://localhost:3000/deployment/deploy-aws-bucket?action=DELETE"
```

4. Undeploy Studio Flow.
   Check in [Studio Dashboard](https://www.twilio.com/console/studio/dashboard)
   that the Flow has been removed.
   Alternatively, you can manually delete the studio flow in the Studio Dashboard:
```
curl "http://localhost:3000/deployment/deploy-studio-flow?action=DELETE"
```

5. Undeploy the application service.
   Goto [Twilio Services](https://www.twilio.com/console/functions/overview/services)
   and delete service.
   
