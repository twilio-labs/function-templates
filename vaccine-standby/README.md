# COVID-19 Vaccine Standby List

This Quick Deploy app is designed for public health agencies to create a COVID-19 vaccine eligibility standby list for their city or state. Residents send an SMS to a pre-configured Twilio phone number, and are asked a series of demographic questions informed by the CDC's vaccine rollout guidelines powered by a Twilio Studio Flow. Resident responses to the SMS chatbot are captured Studio Flow logs and displayed on a password protected section of the `index.html` page of this app.

This data is meant to help ensure vaccinations are administered as quickly as possible as supply becomes available. With this template, your agency can create a standardized list of eligible vaccine recipients. In exchange for sharing this information, residents are instructed that they will be notified when it is their turn to receive the vaccine. The ability to send outbound notifications to those that register is out of the scope of this template.

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable              | Description | Required |
| :-------------------- | :----------------------------------------------------- | :-- |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number for sending and receiving SMS | Yes |
| `ADMIN_PASSWORD`      | Password to restrict access to sensitive data          | Yes |
| `SALT`                | Change this to invalidate existing auth tokens         | No  |

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=vaccine-standby-list && cd example
```

4. Start the server with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:start
```

5. Open the web page at https://localhost:3000/index.html and follow the steps to finish the configuration of your app. You will be prompted to deploy the Studio Flow that contains the contents of the SMS bot to your Twilio account. This studio flow will automatically be associated with the phone number set as the `TWILIO_PHONE_NUMBER` environment variable

6. Once the Studio Flow is deployed, you can text your Twilio phone number to begin testing the app. Your responses will be automatically displayed on this web page with each successful completion of the chat bot interaction from the Twilio Studio Flow execution logs. Studio Logs are stored for 30 days. This section of `index.html` is password protected and can only be viewed by entering `ADMIN_PASSWORD`.

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

### Studio Flow
This app includes a [Twilio Studio](https://www.twilio.com/studio) Flow that orchestrates the SMS chatbot. You will be prompted to deploy the Studio flow as part of the steps included in `index.html`. Once deployed, you can view your flow [here](https://www.twilio.com/console/studio/dashboard) — it will be named "Vaccine Standby Intake".

The default Flow contains the following sequence of interactions:
1. Welcome Message & Opt-In
2. Full Name
3. Age
4. Zip Code
5. Are you an essential worker?
6. Do you work from home?
7. Do you live in a long term care facility?
8. Do you live in a congregate setting?
9. Do you have an underlying health condition increasing risk of severe COVID infection?
10. Notification preference (SMS or Email)
  --> If user chooses email, they will be asked for their email address
11. Language Preference
12. Confirmation

You are encouraged to edit the Studio Flow in accordance with your organization's unique needs.

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```
