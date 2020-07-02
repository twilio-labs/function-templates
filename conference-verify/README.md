# conference-verify

These functions create a conference line that verifies the phone numbers of participants before joining them into a call. It will first verify that the number is on a list of valid numbers and then use [Twilio Verify](https://www.twilio.com/docs/verify/api) to verify they are not spoofing their number by sending them a code they have to enter.

## Pre-requisites

- [Create a Verify Service](https://www.twilio.com/console/verify/services)
- Add `VERIFY_SERVICE_SID` from above to your [Environment Variables](https://www.twilio.com/console/functions/configure)

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable                 | Description                                                                                                                                                               | Required |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------- |
| `ACCOUNT_SID`            | Find in the [console](https://www.twilio.com/console)                                                                                                                     | Yes      |
| `AUTH_TOKEN`             | Find in the [console](https://www.twilio.com/console)                                                                                                                     | Yes      |
| `VERIFY_SERVICE_SID`     | Create one [here](https://www.twilio.com/console/verify/services)                                                                                                         | Yes      |
| `MODERATOR_PHONE_NUMBER` | The phone number of the person moderating the conference line. People will stay in a lobby until this number joins. If the number leaves the conference, the line closes. | Yes      |
| `VALID_PARTICIPANTS`     | Phone numbers of valid participants. Comma separated                                                                                                                      | Yes      |

### Function Parameters

`/verify-conference` expects any default [Twilio Voice webhook request parameter](https://www.twilio.com/docs/voice/twiml#request-parameters). It's also protected meaning it can only be accessed by Twilio once deployed.

`/join-conference` should not be used alone and instead is used by `/verify-conference`.

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init verify-conference --template=conference-verify && cd verify-conference
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

Once deployed make sure you set up the URL ending with `/verify-conference` as your voice webhook URL for your phone number. For example:

```
twilio phone-numbers:update <yourTwilioNumber> --voice-url=https://verify-conference-0000-dev.twil.io/verify-conference
```
