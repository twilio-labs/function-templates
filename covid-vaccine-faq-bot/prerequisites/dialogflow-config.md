# Google Dialogflow Configuration

The conversational chatbot is powered by an integration between Twilio and Google Dialogflow, a natural language understanding platform used to design and integrate a conversational user interfaces. You need to create a Dialogflow _agent_ to drive the conversational chatbot exposed via Twilio messaging channels. Your Dialogflow agent will be called by the Studio Flow included in this app each time an inbound message is sent.

## Create a new Dialogflow Agent
To get started, visit the [Dialogflow Console](https://dialogflow.cloud.google.com/#/getStarted) and click on the **Create Agent** button in the left nav:
![Create Dialogflow Agent](https://user-images.githubusercontent.com/4605360/121387444-88118f80-c8ff-11eb-8c6f-565550c738fb.png)

Give your agent a name, select the default language you will want the agent to use, and be sure to select the Google Cloud Project you configured in the [previous prerequisite step](prerequisites/google-cloud-platform-config.md):

![Create Agent Details](https://user-images.githubusercontent.com/4605360/121388593-74b2f400-c900-11eb-9a1d-4b9f996fd64d.png)

Click the **Create** button to save your new Dialogflow Agent.

## Configure your Dialogflow Agent
Next, you will need to train your new agent to be able to answer user questions about the COVID-19 vaccines appropriately.

There are two options for configuring your Dialogflow agent:
1. **Use a pre-built Dialogflow agent**: Start with a pre-built chatbot that has been configured to respond to questions about COVID-19 vaccines. There are multiple pre-built chatbot profiles available that each target different audiences.
2. **Create your own Dialogflow agent**: If the pre-built chatbots do not apply to the audiences

### 1. Use a pre-built Dialogflow chatbot agent

Follow the below steps to configure your Dialogflow pre-built agent in your Google project:

1. Pre-built Dialogflow agents are available under the `prebuilt-chatbots` folder. Learn more about Dialogflow agents [here](https://cloud.google.com/dialogflow/es/docs/agents-overview#:~:text=A%20Dialogflow%20agent%20is%20a,apps%20and%20services%20can%20understand).
2. Go to Agent Settings ([documentation](https://cloud.google.com/dialogflow/es/docs/agents-settings)) under [Google Dialogflow ES Console](https://dialogflow.cloud.google.com/). 
3. Import one of the pre-built agents (zip file) into your Google Dialogflow project (more information [here](https://cloud.google.com/dialogflow/es/docs/agents-settings#export)).

![import_agent](https://user-images.githubusercontent.com/4605360/120849443-f682d600-c52a-11eb-9bfc-b6bd29bc0d9a.png)

### 2. Configure your own Dialogflow chatbot agent

Messaging around vaccine hesitancy should be tailored to specific audiences for maximum effectiveness. If you wish to customize the chatbot interactions to have content targeted to the communities that you serve and create your own chatbot agents, you can use the Jupyter notebook `studioflow-agent-generator.ipynb` under the `prebuilt-chatbots/make-your-own/` folder. You can open the notebook in [Google Colab](colab.research.google.com) and optionally mount a [Google Drive](https://drive.google.com/) directory to use as the notebook's file system. The notebook consists of three sections:
 
1. An example which shows how to extract question/answer pairs from an HTML (or any XML) format, and convert those question/answer pairs into a CSV format.
2. Data upsampling in the shape of paraphrase generation. This section generates paraphrases for each of the questions and generates the intents that will later be included in the dialogflow agent. The output for this section is a second intermediate CSV file which you can check for correctness and manually edit before generating the chatbot agent.
3. Creating a chatbot agent out of the output CSV file from section (2). The output will be a directory containing .json files that can zipped and uploaded directly to Google Dialogflow.

You can find more specific instructions in the `studioflow-agent-generator.ipynb` Jupyter notebook. 

Once you have your agent ready, follow Steps 2 and 3 from Option 1 to configure your Dialogflow agent in your Google project.
