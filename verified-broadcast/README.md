# SMS Broadcast

Use this app to broadcast SMS messages to large numbers of people. Users sign up via a web interface and can select interests. The app makes use of the Verify API for authentication at sign up and to validate broadcasts and the Notify API for broadcasting messages.

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable                     | Description                                                                                                                                                       | Required |
| :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| BROADCAST_NOTIFY_SERVICE_SID | A [Notify Service Sid](https://www.twilio.com/console/notify/services) which is connected to a Messaging Service. See below for setup instructions      
| VERIFY_SERVICE_SID           | Create one [here](https://www.twilio.com/console/verify/services)                                                                | Yes      |
| BROADCAST_ADMIN_NUMBER       | A phone number (in [e.164 format](https://www.twilio.com/docs/glossary/what-e164)) that is allowed to broadcast messages to subscribers. Will be used for broadcast verification. | Yes      |

### Function Parameters

`start-verify.js` expects the following parameters:

| Parameter      | Description                                 | Required |
| :------------- | :------------------------------------------ | :------- |
| `to`       | Subscriber phone number. Defaults to admin phone number from config. | No  |

`broadcast.js` expects the following parameters:

| Parameter      | Description                                 | Required |
| :------------- | :------------------------------------------ | :------- |
| `body`     | Message body to send to subscribers             | Yes |
| `code`     | One-time passcode sent via SMS.                 | Yes |
| `tag`      | Notify [tag](https://www.twilio.com/docs/notify/api/notification-resource#create-a-notification-resource) to filter broadcast. | No |

`subscribe.js` expects the following parameters:

| Parameter      | Description                                 | Required |
| :------------- | :------------------------------------------ | :------- |
| `to`       | Subscriber phone number. Used for identity.     | Yes |
| `code`     | One-time passcode sent via SMS.                 | Yes |
| `tags`     | Notify [tags](https://www.twilio.com/docs/notify/api/notification-resource#create-a-notification-resource) to filter broadcast. Defaults to 'all'. | No |

## Setup

### Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init broadcast --template=verified-broadcast && cd broadcast
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

### Create a Verify Service

In the console, create a [Verify service](https://www.twilio.com/console/verify/services). Verify manages sending and checking one time passcodes and helps secure your application and prevent spam.

You will need the generated SID for this service to configure your environment in the next step.

### Deploy the Function template

Add the Notify Service SID to the `.env` file as `BROADCAST_NOTIFY_SERVICE_SID` and the Verify Service SID as `VERIFY_SERVICE_SID`. Add the phone number of the admin that is permitted to send broadcast messages to the `.env` file as `BROADCAST_ADMIN_NUMBER`.

Deploy your functions and assets with the following command. Note: you must run this command from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

To deploy the function with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart) run the following:

```
twilio serverless:deploy
```

In a few moments your Function should be deployed! Grab its URL from the results, as we will now need to configure it for incoming SMS messages to our Messaging service.

## Usage

Once the Function is deployed, people can subscribe via the form on `/subscribe.html`. Users can respond `stop/start` to use Twilio's built-in stop handling to opt a user out from, or back in to, receiving messages (check out this article for [further details on Twilio's built-in features for handling opt-out/in keywords](https://support.twilio.com/hc/en-us/articles/223134027-Twilio-support-for-opt-out-keywords-SMS-STOP-filtering-)).

Administrators can use the form on `/broadcast.html` to send a message out to all subscribed users. This will send an OTP to the administrator for verification before broadcasting a message.  
