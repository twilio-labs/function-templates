// Imports the Google Cloud API library
const {SessionsClient} = require('@google-cloud/dialogflow');
 
exports.handler = async function (context, event, callback) {
 
 let query = event.utterance;
 
 // google requires an environment variable called GOOGLE_APPLICATION_CREDENTIALS that points to a file path with the service account key file (json) to authenticate into their API
 // to solve for this, we save the key file as a private asset, then use a helper function to find and return the path of the private asset.
 // lastly we set the environment variable dynamically at runtime so that it's in place when the sessions client is initialized
//process.env.GOOGLE_APPLICATION_CREDENTIALS = Runtime.getAssets()['/service-account-key.json'].path;
 
 const client = new SessionsClient();
 
 // dialogflow keeps conversation state organized by session ids.  in order to have back and forth passes with dialogflow, we need to maintain a consistent
 // session id throughout the dialog.  if one doesn't exist, generate it.  if it does, use what we have.
 if (!event.dialogflow_session_id){
   event.dialogflow_session_id = Math.random().toString(36).substring(7);
 }
 
 const request = {
   session: client.projectAgentSessionPath(
     context.DIALOGFLOW_ES_PROJECT_ID,
     event.dialogflow_session_id
   ),
   queryInput: {
     text: {
       text: query,
       languageCode: 'en-US',
     },
   },
 };
 
 // es6 async/await - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
 try {
   let [response] = await client.detectIntent(request);
   console.log(response);
   // pass session id back in the response to make it easier to continue the conversation
   response.queryResult.session_id = event.dialogflow_session_id;
   callback(null, response.queryResult);
 } catch (error) {
   console.error(error);
   callback(error);
 }
}
