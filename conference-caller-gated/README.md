# conference-caller-gated

Only allow certain numbers to join the conference call. This won't do any verification that the caller is not spoofing the number. For that check out the [Conference Line with Phone Verification](https://www.twilio.com/code-exchange/conference-verification)

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable                 | Description                                                                                                                                                               | Required |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------- |
| `MODERATOR_PHONE_NUMBER` | The phone number of the person moderating the conference line. People will stay in a lobby until this number joins. If the number leaves the conference, the line closes. | Yes      |
| `VALID_PARTICIPANTS`     | Phone numbers of valid participants. Comma separated                                                                                                                      | Yes      |

### Function Parameters

`/gated-conference` is protected and requires a valid Twilio signature as well as the following parameters:

| Parameter | Description                                                                                                                                      | Required |
| :-------- | :----------------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| `From`    | The phone number of the caller. This will automatically be passed by Twilio if you configure your Function as webhook handler for incoming calls | yes      |

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=conference-caller-gated && cd example
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

Once deployed make sure you set up the URL ending with `/gated-conference` as your voice webhook URL for your phone number. For example:

```
twilio phone-numbers:update <yourTwilioNumber> --voice-url=https://example-0000-dev.twil.io/gated-conference
```
