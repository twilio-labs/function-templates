var got = require('got');
exports.handler = function(context, event, callback) {
var requestPayload = {
        "recipients": [
          {
            "address": {
              "email": context.TO_EMAIL_ADDRESS
            }
          }
        ],
        "content": {
          "from": {
            "email": context.FROM_EMAIL_ADDRESS
          },
          "subject": "New SMS Message",
          "text": event.Body
        }
	};

got.post('https://api.sparkpost.com/api/v1/transmissions?num_rcpt_errors=3', 
  {body: JSON.stringify(requestPayload), headers: { 'Authorization': context.SPARKPOST_API_KEY,'Content-Type': 'application/json','accept': 'application/json' }, json: true})
  .then(function(response) {
   callback(null, response.body);
  })
  .catch(function(error) {
    callback(error)
  })
}
