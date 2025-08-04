# email-events-sms

This template tracks and sends SMS alerts of email open and click statuses from SendGrid webhooks.

## Pre-requisites

- A [SendGrid account](https://signup.sendgrid.com/) for sending emails and configuring webhooks
- A Twilio account with an active phone number

### Environment variables

This project requires some environment variables to be set. A file named `.env` is used to store the values for those environment variables. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable | Description | Required |
| :------- | :---------- | :------- |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number that will send the SMS alerts | Yes |
| `MY_PHONE_NUMBER` | The phone number that will receive the email event notifications (in E.164 format) | Yes |

### Function Parameters

`/send-event` is a protected webhook endpoint that receives SendGrid email events and requires:

| Parameter | Description | Required |
| :-------- | :---------- | :------- |
| SendGrid webhook data | JSON payload containing email event data (open/click events) | Yes |

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=email-events-sms && cd example
```

4. Start the server with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:start
```

5. Open the web page at https://localhost:3000/index.html for setup instructions and configure your SendGrid webhook

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```

## SendGrid Configuration

After deploying your Twilio Function, configure SendGrid to send webhook events to your endpoint:

1. Copy your deployed **Webhook URL** (it should end with `/send-event`)
2. Navigate and login to your SendGrid dashboard
3. Head to the [**Mail Settings**](https://app.sendgrid.com/settings/mail_settings) section under the settings drop down
4. Under the **Event Settings** section, click on **Event Webhook**
5. Click **Create new webhook**
6. Enter your Webhook URL within the **Post URL** textbox
7. Within the **Engagement Data** section, click the **Opened** and **Clicked** checkboxes. This will enable webhook event tracking for only those two events

Once configured, SendGrid will send open and click webhook notifications to your Twilio Function. Test out your application by sending an email with SendGrid. You can use the [**categories**](https://www.twilio.com/docs/sendgrid/for-developers/sending-email/categories) field so that the SMS alert will show which category the email event is from. 
