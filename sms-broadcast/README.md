# SMS Broadcast

Use this app to broadcast SMS messages to large numbers of people.

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable                     | Description                                                                                                                                                       | Required |
| :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| BROADCAST_NOTIFY_SERVICE_SID | A Notify Service Sid which is connected to a Messaging Service. See below for setup instructions                                                                  | Yes      |
| BROADCAST_ADMIN_NUMBERS      | A comma separated list of phone numbers (in [e.164 format](https://www.twilio.com/docs/glossary/what-e164)) that are allowed to broadcast messages to subscribers | Yes      |

### Function Parameters

`/broadcast` expects to receive an incoming webhook from an inbound SMS message. It is protected and requires a valid Twilio signature, it uses the `From` and `Body` parameters.

## Setup

### Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=broadcast-sms && cd example
```

Before using this Function, you will need to create (or use an existing) Notify service and Messaging service. The Notify service will use the Messaging service to send out SMS messages. The Messaging service will be configured to send incoming messages to your Subscribe/Broadcast function.

### Create a Messaging Service

Go to the console and [create a messaging service](https://www.twilio.com/console/sms/services). Choose the "Notifications, Two-way" use case to preset some options on the service.

Once created, click on the left nav link for "Numbers" and add (or buy) a phone number to use with this service. This will be the phone number(s) your end users will interact with.

We'll need to come back here later - consider leaving this page open in a tab while you proceed to the next step in the console.

### Create a Notify Service

In the console, create a [Notify service](https://www.twilio.com/console/notify/services). Our function code uses Notify to store our subscriber list and to send out notifications. After your service is created, locate the Dropdown in your Notify service config labeled "Messaging Service SID". You should be able to choose the Messaging Service we created in the last step.

You will need the generated SID for this service to configure your environment in the next step.

Don't forget to save your changes!

### Deploy the Function template

Add the Notify Service SID to the `.env` file as `BROADCAST_NOTIFY_SERVICE_SID`. Add the phone numbers of admins that are permitted to send broadcast messages to the `.env` file as `BROADCAST_ADMIN_NUMBERS`.

Deploy your functions and assets with the following command. Note: you must run this command from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

To deploy the function with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart) run the following:

```
twilio serverless:deploy
```

In a few moments your Function should be deployed! Grab its URL from the results, as we will now need to configure it for incoming SMS messages to our Messaging service.

### Handle incoming messages with your Function

Go back to the [messaging service](https://www.twilio.com/console/sms/services) you created earlier. In its configuration, you'll see a checkbox for "Handle Incoming Messages". Click this box to enable the feature. In the text box that appears, paste in the URL to the Function we just deployed. Click "Save".

Now if all went well, you'll be able to start using your phone number for managing broadcasts and subscriptions!

## Usage

Once the Function is deployed and your Twilio phone number is set up, folks can text anything to it to receive a brief informational message about what commands are available.

* `subscribe` - subscribes the current number for updates from the service
* `stop/start` - uses Twilio's built-in stop handling to opt a user out from, or back in to, receiving messages (check out this article for [further details on Twilio's built-in features for handling opt-out/in keywords](https://support.twilio.com/hc/en-us/articles/223134027-Twilio-support-for-opt-out-keywords-SMS-STOP-filtering-))
* `broadcast <message content>` - Administrators can use the broadcast command to send a message out to all subscribed users. Not included in help text.

To edit the copy for any of the messages, open the function code and look for the text strings at the top of the file.
