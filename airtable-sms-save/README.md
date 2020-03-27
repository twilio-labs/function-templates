# Save SMS

This Function in `save-sms.js` will save the details of an inbound
SMS message to an Airtable base.

# Broadcast SMS

This Function in `boardcast-sms.js` will broadcast a message to a list
of phone numbers stored in an Airtable base.

### Parameters

This Function expects the incoming request to be a messaging webhook. The parameters that will be used are `From` and `Body`.
