// Imports the Google Cloud API library
const {SessionsClient} = require('@google-cloud/dialogflow');
 
exports.handler = async function (context, event, callback) {
 
 let query = event.utterance;
 
const client = new SessionsClient({
  keyFilename: Runtime.getAssets()[context.GOOGLE_APPLICATION_CREDENTIALS].path
});
 
 // dialogflow keeps conversation state organized by session ids.  in order to have back and forth passes with dialogflow, we need to maintain a consistent
 // session id throughout the dialog.  if one doesn't exist, generate it.  if it does, use what we have.
 if (!event.dialogflow_session_id){
   event.dialogflow_session_id = Math.random().toString(36).substring(7);
 }
 
 const request = {
   session: client.projectAgentSessionPath(
     context.GOOGLE_CLOUD_PROJECT_ID,
     event.dialogflow_session_id
   ),
   queryInput: {
     text: {
       text: query,
       languageCode: context.LANGUAGE_CODE,
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
