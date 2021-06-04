# COVID-19 Vaccine SMS FAQ Bot 

This Vaccine Hesitancy template application is designed to address COVID-19 vaccine hesitancy among consumers and answer their vaccine-related questions. Consumers ask their questions by sending  SMS to a pre-configured phone number, and are responded to by a FAQ chatbot which is built using trusted data sources for answers. The chatbot is powered by Google Dialogflow ES and Twilio Studio flow connects the chatbot with Twilio’s Programmable SMS channel. The application can be extended to other digital channels such as Voice, Whatsapp or Webchat. 

It includes 2 pre-built chatbot agents:
1. US bot is based on <a href="https://www.ama-assn.org/delivering-care/public-health/covid-19-vaccines-patients-frequently-asked-questions" target="_blank"> American Medical Assocaition </a>
2. India bot is based on <a href="https://www.mohfw.gov.in/covid_vaccination/vaccination/faqs.html" target="_blank"> Ministry of Health and Family Welfare </a> 

Note that this app is designed for prototyping purposes only and you should <a href="https://ahoy.twilio.com/vaccine-distribution-1" target="_blank">consult with a Twilio Expert</a> before publicly offering this service in a production context.

## Prerequisites

### 1. Configure Google Cloud Platform and Generate JSON Auth Key

This template uses Google Dialogflow to power the conversational chatbot
agent that interacts with the user. You will need to setup a Google Cloud project, enable the Dialogflow API, and generate a JSON authentication key from a GCP Service Account for Twilio to use to interact with Dialogflow. Place the GCP JSON authentication key at the following path: `/assets/service-account-key.json`.

**Follow [this guide](prerequisites/google-cloud-platform-config.md) for step-by-step instructions on how to do this.**

### 2. Create a Dialogflow Chatbot Agent

**II. [OPTION 1] Configure pre-built Dialogflow chatbot agent:**

Follow the below steps to configure your Dialogflow pre-built agent in your Google project:

1. Pre-built Dialogflow agents are available under the `prebuilt-chatbots` folder. Learn more about Dialogflow agents [here](https://cloud.google.com/dialogflow/es/docs/agents-overview#:~:text=A%20Dialogflow%20agent%20is%20a,apps%20and%20services%20can%20understand).
2. Go to Agent Settings ([documentation](https://cloud.google.com/dialogflow/es/docs/agents-settings)) under [Google Dialogflow ES Console](https://dialogflow.cloud.google.com/). 
3. Import one of the pre-built agents (zip file) into your Google Dialogflow project (more information [here](https://cloud.google.com/dialogflow/es/docs/agents-settings#export)).

![import_agent](https://user-images.githubusercontent.com/4605360/120849443-f682d600-c52a-11eb-9bfc-b6bd29bc0d9a.png)

**II. [OPTION 2] Configure your own Dialogflow chatbot agent:**

Messaging around vaccine hesitancy should be tailored to specific audiences for maximum effectiveness. If you wish to customize the chatbot interactions to have content targeted to the communities that you serve and create your own chatbot agents, you can use the Jupyter notebook `studioflow-agent-generator.ipynb` under the `prebuilt-chatbots/make-your-own/` folder. You can open the notebook in [Google Colab](colab.research.google.com) and optionally mount a [Google Drive](https://drive.google.com/) directory to use as the notebook's file system. The notebook consists of three sections:
 
1. An example which shows how to extract question/answer pairs from an HTML (or any XML) format, and convert those question/answer pairs into a CSV format.
2. Data upsampling in the shape of paraphrase generation. This section generates paraphrases for each of the questions and generates the intents that will later be included in the dialogflow agent. The output for this section is a second intermediate CSV file which you can check for correctness and manually edit before generating the chatbot agent.
3. Creating a chatbot agent out of the output CSV file from section (2). The output will be a directory containing .json files that can zipped and uploaded directly to Google Dialogflow.

You can find more specific instructions in the `studioflow-agent-generator.ipynb` Jupyter notebook. 

Once you have your agent read, follow Steps 2 and 3 from Option 1 to configure your Dialogflow agent in your Google project.

### Environment variables

This application requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable | Description | Required |
| :------------------------------- | :----------------------------------------------------------------------------------------------------------------------  | :-- |
| `TWILIO PHONE NUMBER`            | Your Twilio phone number for sending and receiving SMS (find this [in the console here](https://www.twilio.com/console/phone-numbers/incoming))| Yes |
| `DIALOGFLOW_ES_PROJECT_ID`       | Your Google Dialog Flow Project ID ([instructions here](https://cloud.google.com/resource-manager/docs/creating-managing-projects#identifying_projects))                                                                                                              | Yes |
| `FLOW_SID`                       | SID of Studio Flow for chatbot. Will be set automatically                                                                        | No  |
| `GOOGLE_APPLICATION_CREDENTIALS` | Service account key file (json) to authenticate into dialogflow API                                                      | No  |

### Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=vaccine-bot-faq && cd example
```

4. Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```

4. Open the `index.html` page and follow the steps to finish the configuration of your app. You will be prompted to deploy the Studio Flow that contains the contents of the SMS bot to your Twilio account. This studio flow will automatically be associated with the phone number set as the `TWILIO_PHONE_NUMBER` environment variable

5. Once the Studio Flow is deployed, you can text your Twilio phone number to begin testing the app.

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

### Studio Flow
This app includes a [Twilio Studio](https://www.twilio.com/studio) Flow that orchestrates the SMS chatbot. You will be prompted to deploy the Studio flow as part of the steps included in `index.html`. Once deployed, you can view your flow [here](https://www.twilio.com/console/studio/dashboard) — it will be named "Vaccine FAQ Bot".

You are encouraged to edit the Studio Flow in accordance with your organization's unique needs.
