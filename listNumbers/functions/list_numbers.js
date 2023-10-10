exports.handler = async function(context, event, callback) {

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const subAccount = event.subAcc;
const password=event.pass;
const page_size=event.pageSize;
const page=event.page;
const client = require('twilio')(accountSid, authToken, { accountSid: subAccount });
const pageToken=event.pageToken;

const response = new Twilio.Response();

if (password != process.env.Password){
    var final_data={er:0};
    return callback(null, final_data);  
}

else if (page_size>0){
   var page_resp = await client.incomingPhoneNumbers
        .page({pageSize:page_size, Page: page, pageToken:pageToken});

      return callback(null, page_resp);

}

else {

  try{

    var resp = await client.incomingPhoneNumbers
        .list();

      return callback(null, resp);
      
    }
    catch (error) {
      console.error(error.message);
      response.setStatusCode(error.status || 400);
      response.setBody({ error: error.message });
      return callback(null, response);


    };  
  }
}

