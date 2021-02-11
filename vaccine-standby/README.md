# COVID-19 Vaccine Standby List

This Quick Deploy app is designed for public health agencies to create a COVID-19 vaccine eligibility standby list for their city or state. Residents send an SMS to a pre-configured phone number, and are asked a series of demographic questions informed by the CDC's vaccine rollout guidelines powered by a Twilio Studio Flow. Resident responses to the SMS chatbot are captured in an Airtable base. 

This data is meant to help ensure vaccinations are administered as quickly as possible as supply becomes available. With this template, your agency can create a standardized list of eligible vaccine recipients. In exchange for sharing this information, residents are notified when it is their turn to receive the vaccine.

## Pre-requisites

### Airtable configuration
This app stores the data sent by the resident in response to the SMS chatbot in Airtable to demonstrate a working persistance layer. Follow the steps below to grab all the Airtable identifiers needed to be set as environment variables for this app:

1. [Sign up](https://airtable.com/signup) for an Airtable account if you don't already have one.

2. Copy the [COVID-19 Vaccine Standby List base](https://airtable.com/universe/expeJaAHwR6NK9al0/covid-19-vaccine-standby-list) from Airtable Universe by clicking the "Copy base" button as shown below:

![Airtable Universe Copy](https://twilio-cms-stage.s3.amazonaws.com/images/copy-airtable-base_hHaKfoW.width-800.png)

3. Click on your new base from your Airtable homepage to open it. Then, follow [these steps](https://support.airtable.com/hc/en-us/articles/217846478-Embedding-a-view-or-base) to create a share link for your base and click the embed icon to launch the embed base preview page as shown below:

![Embed icon](https://twilio-cms-stage.s3.amazonaws.com/images/launch-embed-view.width-500.png)

Next, click in the dark box and copy the the entire Embed code HTML to your clipboard (ctrl+c / cmd+c):

![Embed code](https://twilio-cms-stage.s3.amazonaws.com/images/copy-embed-code.width-500.png)

4. You are now ready to grab all the Airtable identifiers required as environment variables:

- Paste the contents of your clipboard as the value of `AIRTABLE_EMBED_CODE` in the `.env` file (should be the entire HTML string of the embeddable iframe). 
- Go to the [Airtable REST API docs](https://airtable.com/api), and select your new base. Copy your base ID shown (beginning with app) and set it as the value of `AIRTABLE_BASE_ID` in the `.env` file
- Go to your [Airtable Account page](https://airtable.com/account) and generate an API key ([instructions](https://support.airtable.com/hc/en-us/articles/219046777-How-do-I-get-my-API-key-)). Copy the API key and set it as the value of `AIRTABLE_API_KEY` in the `.env` file

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable              | Description | Required |
| :-------------------- | :----------------------------------------------------- | :-- |
| `MY_PHONE_NUMBER`     | Your Twilio phone number for sending and receiving SMS | Yes |
| `AIRTABLE_API_KEY`    | Your Airtable API key                                  | Yes |
| `AIRTABLE_BASE_ID`    | The Airtable Base ID. Base should be copied from the [vaccine standby list template](https://airtable.com/universe/expeJaAHwR6NK9al0/covid-19-vaccine-standby-list) on Airtable Universe | Yes |
| `AIRTABLE_EMBED_CODE` | Full HTML string of embed code of your Airtable base. You can grab this from the embed preview page | Yes |

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

5. Open the web page at https://localhost:3000/index.html and follow the steps to finish the configuration of your app. You will be prompted to deploy the Studio Flow that contains the contents of the SMS bot to your Twilio account. This studio flow will automatically be associated with the phone number set as the `MY_PHONE_NUMBER` environment variable

6. Once the Studio Flow is deployed, you can text your Twilio phone number to begin testing the app. Your responses will be automatically stored in Airtable and displayed on this web page with each successful completion of the chat bot interaction

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
