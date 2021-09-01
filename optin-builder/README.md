# Twilio Opt-In Builder

Easily create an embedable SMS Opt-In form to collect contacts for your campaign.

![Twilio Keyword Screenshot](https://user-images.githubusercontent.com/1418949/121948197-c944dd80-cd0b-11eb-8ce3-53a1405eb557.png)

## Key Features

* Live editor allows you to preview your signup form.
* Customizable logo, content, and colors.
* Generate compliance language and terms of service.
* Track opt-ins via webhook, Segment, or Airtable.
* Supports one-click keyword opt-in on Android and iOS.

## Pre-requisites

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started):

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```
## Setup

3. Clone the repository and `cd` into it:
```shell
git clone git@github.com:cweems/twilio-keyword.git

cd twilio-keyword
```
4. Install dependencies:
```shell
npm install
```
5. Create `.env` file and set environment variables:
```shell
cp .env.example .env
```
> Note: you'll need to set `ACCOUNT_SID`, `AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `ADMIN_PHONE_NUMBER`, and `ADMIN_PASSWORD` before deploying. All other environment variables can be set by the opt-in builder. If you're using Quick Deploy, these initial environemnt variables will be set for you.

6. Deploy to Twilio Serverless:
```shell
twilio serverless:deploy

# View your opt-in builder at https://[my-runtime-url].twil.io/index.html
```

7. Optional: develop locally if you want to edit HTML / CSS / JavaScript:
```shell
twilio serverless:start --live
```

### Environment Variable Reference
If you're running this project locally, you'll need to manually set environment variables in your `.env` file. When run on Twilio Serverless, environment variables are automatically set when you click the `Save Settings` button.

To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

| Environment Variable        | Description                                                                                                                                                                                 | Required?   |
|-----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| ACCOUNT_SID                 | Your Twilio Account SID                                                                                                                                                                     | Required    |
| AUTH_TOKEN                  | Your Twilio Account Auth Token                                                                                                                                                              | Required    |
| TWILIO_PHONE_NUMBER         | The phone number that you will send SMS opt-ins from.                                                                                                                                       | Required    |
| ADMIN_PHONE_NUMBER          | Your personal phone number, we use this as a username when you save settings, and also to send you and SMS when your configuration changes.                                                 | Required    |
| ADMIN_PASSWORD              | Your password for updating settings via the live editor.                                                                                                                                    | Required    |
| LOGO_URL                    | A publicly accessible link to your organization's logo.                                                                                                                                     | Recommended |
| CAMPAIGN_TITLE              | The title of your opt-in page campaign. It should indicate what kinds of SMS your user is signing up for.                                                                                   | Required for compliance |
| CAMPAIGN_DESCRIPTION        | A brief description of your opt-in campaign. What types of messages will the user receive?                                                                                                  | Required for compliance |
| MESSAGE_FREQUENCY            | The number of messages and cadence that a user will receive messages.                                                                                                                                 | Required for compliance |
| BUTTON_CTA                  | The text on the button to register for the campaign.                                                                                                                                        | Recommended |
| OPT_IN_KEYWORD              | The keyword that the user must respond with for double opt-in.                                                                                                                              | Required for compliance    |
| SUBSCRIBE_CONFIRMATION      | The message that the user will receive once they have confirmed using double opt-in.                                                                                                        | Required for compliance    |
| CONTACT_INFORMATION         | Your organization's contact information for compliance purposes (included in the Terms of Service). This could be a support email or toll-free number.                                      | Required    |
| CUSTOM_CSS                  | A link to a custom stylesheet.                                                                                                                                                              | Optional    |
| BACKGROUND_COLOR            | The background color for your signup page.                                                                                                                                                  | Optional    |
| FONT_COLOR                  | The font color for your signup page.                                                                                                                                                        | Optional    |
| PRIVACY_POLICY_LINK         | A link to your organization's privacy policy.                                                                                                                                               | Recommended required for compliance |
| DATA_SOURCE                 | The data storage destination for your opt-ins. Can be `webhook`, `airtable`, or `segment`.                                                                                                        | Optional    |
| SEGMENT_WRITE_KEY           | The write key for your Segment Node.js source. Will be used to track opt-in events.                                                                                                         | Optional    |
| AIRTABLE_API_KEY            | API key for your Airtable base if you are storing opt-ins in Airtable.                                                                                                                      | Optional    |
| AIRTABLE_BASE_ID            | Base ID for the Airtable base where you'll be storing opt-ins.                                                                                                                              | Optional    |
| AIRTABLE_TABLE_NAME         | Name of the table where you'll be storing your opt-ins.                                                                                                                                     | Optional    |
| AIRTABLE_PHONE_COLUMN_NAME  | Name of the Airtable column where you'll store the phone numbers of your opt-ins. We'll check this column for existing opt-ins and remove the opt-in if the user responds with a stop word. | Optional    |
| AIRTABLE_OPT_IN_COLUMN_NAME | Name of the column where you'll store opt-in status in Airtable. Values can be true / false.                                                                                                | Optional    |
| WEBHOOK_URL                 | URL to a webhook on your own custom app that will receive Opt-In events.                                                                                                                    | Optional    |


