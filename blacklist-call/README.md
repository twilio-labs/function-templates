# Twilio Blacklist Call


This function in `blacklist-call.js` allows users to setup a blacklist to reject unwanted phone numbers. See [here](https://support.twilio.com/hc/en-us/articles/360034788313-Reject-Incoming-Calls-with-a-Phone-Number-Blacklist) for a more in-depth guide.



### Parameters

This Function expects the incoming request to be a messaging webhook. The parameters that will be used are `From` and `blacklist`.
