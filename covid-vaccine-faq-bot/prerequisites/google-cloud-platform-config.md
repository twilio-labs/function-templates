# Google Cloud Platform Account Configuration

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

**Important** — you must grant your Service Account access to your Google Cloud Project to successfully authenticate with Dialogflow. We recommend choosing the **Dialogflow Service Agent** Role to scope access just to what is needed:

![Scoping access to Service Key](https://user-images.githubusercontent.com/4605360/121431793-b65a9380-c92e-11eb-8834-0c11ce1e49b3.png)


You may want to scope user level access to the service account, but this step is optional and can be skipped. Click *Done* to create the Service Account. 

For more information on creating and managing service accounts, please see this [documentation](https://cloud.google.com/iam/docs/creating-managing-service-accounts).

4. **Generate a JSON Authentication Key**. You will need to generate a JSON authentication key with your service account credentials so Twilio can properly authenticate with Dialogflow. From the [credentials page](https://console.cloud.google.com/apis/credentials), click on the service account you just created. 

Click on *Keys* from the top nav:

![Service Account Keys Nav](https://user-images.githubusercontent.com/4605360/120540827-f903f500-c39d-11eb-9cbe-805b95d82831.png)

Then, click *Add Key* --> *Create New Key* from the dropdown:

![Add Key](https://user-images.githubusercontent.com/4605360/120540973-218bef00-c39e-11eb-83d1-77db93a351ae.png)

When prompted, make sure that you select *JSON* as the Key Type and click *Create*:

![JSON key type](https://user-images.githubusercontent.com/4605360/120541142-5dbf4f80-c39e-11eb-8ec2-6df52eef2be4.png)

The JSON Authentication Key will then be downloaded to your local machine.

5. **Save JSON Authentication Key as a Private Asset**. Take the JSON file you just downloaded, and save it to a file named `service-account-key.private.json` under the `assets` directory for this function template. Here is a one-line command you can run from the root of the template directory to help do that:

```
mv path/to/downloaded/key.json assets/service-account-key.private.json
```
