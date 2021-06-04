# Google Dialogflow Configuration

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

Once you have your agent ready, follow Steps 2 and 3 from Option 1 to configure your Dialogflow agent in your Google project.
