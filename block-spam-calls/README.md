# block-spam-calls

Uses Twilio Add-ons to block unwanted calls by checking the spam ratings of incoming phone numbers.

## Pre-requisites

- A Twilio account - [sign up here](https://www.twilio.com/try-twilio)
- A Twilio phone number
- Spam filtering Add-ons (see below)

### Install Add-Ons

The following guide will help you to [install Add-ons](https://www.twilio.com/docs/add-ons/install). You can access the Add-ons in the Twilio console [here](https://www.twilio.com/console/add-ons). The Spam Filtering Add-ons that are used on this application are:

- [Marchex Clean Call](https://www.twilio.com/console/add-ons/XBac2c99d9c684a765ced0b18cf0e5e1c7)
- [Nomorobo Spam Score](https://www.twilio.com/console/add-ons/XB06d5274893cc9af4198667d2f7d74d09)

Once you've selected the Add-on, just click on `Install` button. Then, you will see a pop-up window where you should read and agree the terms, then, click the button `Agree & Install`. For this application, you just need to handle the incoming voice calls, so make sure the `Incoming Voice Call` box for `Use In` is checked and click `Save`.

### Function Parameters

This template by default accepts no additional parameters.

## Create a new project with the template

1. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)
2. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
3. Initiate a new project

```
twilio serverless:init sample --template=block-spam-calls && cd sample
```

4. Start the server with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:start --ngrok
```

5. Set your incoming call webhook URL for the phone number you want to configure to `https://<your-ngrok-code>.ngrok.io/block-spam-calls`

ℹ️ Check the developer console and terminal for any errors

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```

Make sure to update your incoming voice URL to your newly deployed Function URL.
