# mcp-server

Functions to run a remote MCP server for Twilio API tools

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. A file named `.env` is used to store the values for those environment variables. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

* ACCOUNT_SID
* AUTH_TOKEN
* API_KEY
* API_SECRET

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=mcp-server && cd example
```

4. Start the server with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:start
```

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```

## Integration with MCP clients

`https://<functions-domain>.twil.io/mcp?services=`

Header: x-twilio-signature

@TODO: Code samples to generate x-twilio-signature

Available services
* Messaging (default)
* Voice
* VoiceAddOns
* Conversations
* Studio
* TaskRouter
* Serverless
* Account
* PhoneNumbers
* Applications
* Auth
* AddOns
* Usage

## Example prompts

@TODO

## Security recommendations

This remote MCP server function will provide Tools to your LLM that provide access to your Twilio account. We recommend the following considerations when giving clients access to your server:

- Always set the `requires_approval` field to ensure that there are no unintended actions taken within your account.
- Use scoped permissions for your Twilio API Key. Not all endpoints support scoped permissions, but some do. See https://www.twilio.com/docs/iam/api-keys/restricted-api-keys for more information about which actions are supported per API Service.
- To ensure privacy, do not use other MCP servers in conjunction with your Twilio MCP server.
