# sip-quickstart

Creates and wires up a new SIP domain for incoming and outgoing SIP calls.

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable | Description | Required |
| :------- | :---------- | :------- |
| ACCOUNT_SID | Account SID, automatically populated at creation time | Yes |
| AUTH_TOKEN | Auth Token, automatically populated at creation time | Yes |
| ADMIN_PASSWORD | Password to allow administrators to access */admin/index.html* | Yes |
| DEFAULT_SIP_PASSWORD | Password used to set SIP Credentials created by admin | Yes |

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```shell
twilio serverless:init my-sip-domain --template=sip-quickstart && cd my-sip-domain
```

4. Deploy the server with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```shell
twilio serverless:deploy
```

5. Open the hosted admin page at */admin/index.html* and enter the `ADMIN_PASSWORD` defined in your `.env` file.

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```shell
twilio serverless:deploy
```
