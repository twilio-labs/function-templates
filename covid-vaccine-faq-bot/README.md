# COVID-19 Vaccine SMS FAQ Bot 

This Vaccine Hesitancy template application is designed to address COVID-19 vaccine hesitancy among consumers and answer their vaccine-related questions. Consumers ask their questions by sending  SMS to a pre-configured phone number, and are responded to by a FAQ chatbot which is built using trusted data sources for answers. The chatbot is powered by Google Dialogflow ES and Twilio Studio flow connects the chatbot with Twilio’s Programmable SMS channel. The application can be extended to other digital channels such as Voice, Whatsapp or Webchat. 

It includes 2 pre-built chatbot agents:
1. US bot is based on <a href="https://www.ama-assn.org/delivering-care/public-health/covid-19-vaccines-patients-frequently-asked-questions" target="_blank"> American Medical Association </a>
2. India bot is based on <a href="https://www.mohfw.gov.in/covid_vaccination/vaccination/faqs.html" target="_blank"> Ministry of Health and Family Welfare </a> 

Note that this app is designed for prototyping purposes only and you should <a href="https://ahoy.twilio.com/vaccine-distribution-1" target="_blank">consult with a Twilio Expert</a> before publicly offering this service in a production context.

## Prerequisites

### 1. Configure Google Cloud Platform and Generate JSON Auth Key

This template uses Google Cloud Platform (GCP) and Dialogflow to power the conversational chatbot
agent that interacts with the user. You will need to setup a Google Cloud project, enable the Dialogflow API, and generate a JSON authentication key from a GCP Service Account for Twilio to use to interact with Dialogflow. Place the GCP JSON authentication key at the following path: `/assets/service-account-key.json`.

**Follow [this guide](prerequisites/google-cloud-platform-config.md) for step-by-step instructions on how to do this.**

### 2. Create a Dialogflow Chatbot Agent

The conversational chatbot is powered by an integration between Twilio and Google Dialogflow, a natural language understanding platform used to design and integrate a conversational user interfaces.You may import the pre-built Dialogflow chatbot agents included in this repository, or configure your own chatbot agent.

**Follow [this guide](prerequisites/dialogflow-config.md) for step-by-step instructions on how to do this.**

## Deploying the template
Before deploying the template to your Twilio account, you should make sure to complete the [prerequisite](#prerequisites) steps above, and make sure the following is true:
1. You have an active Google Cloud Project with the Dialogflow API enabled
2. You have a JSON authentication key associated with a Service Account from your Google Cloud Project, and this file is saved to a file named `service-account-key.private.json` under the assets directory for this function template.
3. You have created a Dialogflow agent and configured it either using one of the pre-built agents or have created your own

## Environment variables

This application requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable | Description | Required |
| :------------------------------- | :----------------------------------------------------------------------------------------------------------------------  | :-- |
| `TWILIO PHONE NUMBER`            | Your Twilio phone number for sending and receiving SMS (find this [in the console here](https://www.twilio.com/console/phone-numbers/incoming))| Yes |
| `DIALOGFLOW_ES_PROJECT_ID`       | Your Google Dialog Flow Project ID ([instructions here](https://cloud.google.com/resource-manager/docs/creating-managing-projects#identifying_projects))                                                                                                              | Yes |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account key file (json) to authenticate into dialogflow API. Default is `/service-account-key.json`.                                                      | Yes  |
| `LANGUAGE_CODE` | Language to be used by chatbot. Default is
U.S. English, `en-US`. If changing, set to Dialogflow language
tag found [here](https://cloud.google.com/dialogflow/es/docs/reference/language)                                                      | Yes  |

There is a fifth environment variable, `FLOW_SID`, but that will be set automatically by the app. **Do not** set this value.
| Variable | Description | Required |
| :------------------------------- | :----------------------------------------------------------------------------------------------------------------------  | :-- |
| `FLOW_SID`                       | SID of Studio Flow to orchestrate chatbot messaging. Will be set automatically by the app. Do not configure in advance.                                                                        | No  |

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=covid-vaccine-faq-bot && cd example
```

4. Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```

4. Open the `index.html` page and follow the steps to finish the configuration of your app. You will be prompted to deploy the Studio Flow that contains the contents of the SMS bot to your Twilio account. This studio flow will automatically be associated with the phone number set as the `TWILIO_PHONE_NUMBER` environment variable

5. Once the Studio Flow is deployed, you can text your Twilio phone number to begin testing the app.

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

## Studio Flow
This app includes a [Twilio Studio](https://www.twilio.com/studio) Flow that orchestrates the SMS chatbot. You will be prompted to deploy the Studio flow as part of the steps included in `index.html`. Once deployed, you can view your flow [here](https://www.twilio.com/console/studio/dashboard) — it will be named "Vaccine FAQ Bot".

You are encouraged to edit the Studio Flow in accordance with your organization's unique needs.

## Contributing
Messaging around vaccine hesitancy should be tailored to specific audieces for maximum effectiveness. The included [pre-built chatbot agents](https://github.com/twilio/covid-vaccine-faq-bot/tree/master/prebuilt-chatbots) are intended to provide a starting point, but we understand that there will be many audiences that require different kinds of content to impact vaccine attitudes.

We encourage you to [contribute new pre-built agents](https://github.com/twilio/covid-vaccine-faq-bot/pulls) back to this repo to make them available to other organizations serving similar audiences. Over time, we hope this grows into a growing repository of open-source vaccine hesitancy chatbots that can increase vaccine uptake globally. We are actively seeking contributions for chatbot agents that:

- Are translated into different languages
- Speak to localized vaccine information in different countries, states, and cities
- Address underserved populations or communities with specific needs

There are instructions for how to do this  [here](prerequisites/dialogflow-config.md#2-configure-your-own-dialogflow-chatbot-agent), including a scripting tool to automatically extract question/answer pairs from other vaccine FAQ webpages (HTML or XML format).
