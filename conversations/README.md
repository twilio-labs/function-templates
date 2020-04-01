# conversations

These Functions generate a Conversations-scoped webhook so that you can integrate Twilio Studio with Twilio Conversations.
To learn more, visit https://www.twilio.com/blog/using-twilio-studio-conversations-sms

## Pre-requisites

Follow the instructions in the blog post to configure Conversations to create a new Conversation when SMS messages come in, and configure the `onConversationAdded` webhook URL to point to the URL of this Function.

Check the box in your [Functions configuration dashboard](https://www.twilio.com/console/functions/configure) to enable `ACCOUNT_SID` and `AUTH_TOKEN`. If not, you'll need to add those environment variables manually.

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable          | Meaning                                                  | Required |
| :---------------- | :------------------------------------------------------- | :------- |
| `STUDIO_FLOW_SID` | Create one [here](https://www.twilio.com/console/studio) | Yes      |

### Function Parameters

`/generate-scoped-webhook` expects the following parameters:

| Parameter         | Description                                                                                                                                         | Required |
| :---------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| `ConversationSid` | The SID of the Conversation, which should be automatically created when a new Conversation is added if you follow the instructions in the blogpost. | Yes      |
