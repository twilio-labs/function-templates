# COVID-19 Vaccine SMS FAQ Bot 

This Vaccine Hesitancy template application is designed to address COVID-19 vaccine hesitancy among consumers and answer their vaccine-related questions. Consumers ask their questions by sending  SMS to a pre-configured phone number, and are responded to by a FAQ chatbot which is built using trusted data sources for answers. The chatbot is powered by Google Dialogflow ES and Twilio Studio flow connects the chatbot with Twilio’s Programmable SMS channel. The application can be extended to other digital channels such as Voice, Whatsapp or Webchat. 

It includes 2 pre-built chatbot agents:
1. US bot is based on <a href="https://www.ama-assn.org/delivering-care/public-health/covid-19-vaccines-patients-frequently-asked-questions" target="_blank"> American Medical Assocaition </a>
2. India bot is based on <a href="https://www.mohfw.gov.in/covid_vaccination/vaccination/faqs.html" target="_blank"> Ministry of Health and Family Welfare </a> 

Note that this app is designed for prototyping purposes only and you should <a href="https://ahoy.twilio.com/vaccine-distribution-1" target="_blank">consult with a Twilio Expert</a> before publicly offering this service in a production context.

## Prerequisites

### Setup Google Account

**I. Create and configure your Dialogflow project:**

This template uses Google Dialogflow to power the conversational chatbot agent that interacts with the user. To use the template, you will need to setup a Google Dialogflow project and configure it correctly by following the below steps: 
1. **Create a Google Cloud project [here](https://console.cloud.google.com/projectcreate?previousPage=%2Fprojectselector2%2Fhome%2Fdashboard%3F_ga%3D2.179814308.187099110.1621977491-2130497986.1615817714)**. You will need to give your project a name and and select a billing account, organization, and location as applicable: 

![Create Google Cloud Project](https://user-images.githubusercontent.com/4605360/120536608-27330600-c399-11eb-95cc-c82e6fe874a4.png)

 Once created, double check that [billing is enabled](https://cloud.google.com/billing/docs/how-to/modify-project) for your Cloud project. For more information on creating and managing Google Cloud Platform projects, please see this [documentation](https://cloud.google.com/resource-manager/docs/creating-managing-projects).

2. **Enable Dialogflow API**. Visit [this page](https://console.cloud.google.com/flows/enableapi?apiid=dialogflow.googleapis.com) to enable the Google Dialogflow API by selecting your Project from the dropdown and clicking *Continue*:

![Enable Dialogflow API](https://user-images.githubusercontent.com/4605360/120537788-8f361c00-c39a-11eb-9e2b-af3293d135ae.png)

You should see a confirmation that the Dialogflow API was enabled. Then, click *Go to credentials*.

![Enable API Success](https://user-images.githubusercontent.com/4605360/120538437-5c405800-c39b-11eb-9a7a-0739cd1364c1.png)

3. **Create Service Account**. You will need a Service Account for Twilio to successfully authenticate with Google Dialogflow. You should have been redirected to the Create Credentials page. If not, [access it here](https://console.cloud.google.com/apis/credentials/wizard?api=dialogflow.googleapis.com).

Ensure that *Dialogflow API* is selected in the *Which API are you using?* dropdown. Then, select the *Application Data* radio button, and select *No, I'm not using them* when asked about Compute Engine, Kubernetes, etc as shown below:

![Create Credentials](https://user-images.githubusercontent.com/4605360/120538789-ca851a80-c39b-11eb-940f-683e4173aceb.png)

 Click *Next*. This will take you to the Create Service Account page. Give your Service Account a name and a description, then click *Create*:

 ![Create Service Account](https://user-images.githubusercontent.com/4605360/120539852-dfae7900-c39c-11eb-8c0a-a7953671419a.png)

You may want to scope user and role level access to the service account, but these two steps are optional and can be skipped. Click *Done* to create the Service Account. 

For more information on creating and managing service accounts, please see this [documentation](https://cloud.google.com/iam/docs/creating-managing-service-accounts).

4. **Generate a JSON Authentication Key**. You will need to generate a JSON authentication key with your service account credentials so Twilio can properly authenticate with Dialogflow. From the [credentials page](https://console.cloud.google.com/apis/credentials), click on the service account you just created. 

Click on *Keys* from the top nav:

![Service Account Keys Nav](https://user-images.githubusercontent.com/4605360/120540827-f903f500-c39d-11eb-9cbe-805b95d82831.png)

Then, click *Add Key* --> *Create New Key* from the dropdown:

![Add Key](https://user-images.githubusercontent.com/4605360/120540973-218bef00-c39e-11eb-83d1-77db93a351ae.png)

When prompted, make sure that you select *JSON* as the Key Type and click *Create*:

![JSON key type](https://user-images.githubusercontent.com/4605360/120541142-5dbf4f80-c39e-11eb-8ec2-6df52eef2be4.png)

The JSON Authentication Key will then be downloaded to your local machine.

5. **Save JSON Authentication Key as a Private Asset**. Take the JSON file you just downloaded, and save it to a file named `service-account-key.private.json` under the `assets` directory for this function template.

**II. [OPTION 1] Configure pre-built Dialogflow chatbot agent:**

Follow the below steps to configure your Dialogflow pre-built agent in your Google project:

1. Pre-built Dialogflow agents are available under the `prebuilt-chatbots` folder. Learn more about Dialogflow agents [here](https://cloud.google.com/dialogflow/es/docs/agents-overview#:~:text=A%20Dialogflow%20agent%20is%20a,apps%20and%20services%20can%20understand).
2. Go to Agent Settings ([documentation](https://cloud.google.com/dialogflow/es/docs/agents-settings)) under [Google Dialogflow ES Console](https://dialogflow.cloud.google.com/). 
3. Import one of the pre-built agents (zip file) into your Google Dialogflow project (more information [here](https://cloud.google.com/dialogflow/es/docs/agents-settings#export)).

![Image](screenshots/import_agent.png "Import Agent Screenshot")

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