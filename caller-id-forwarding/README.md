# Caller ID with Call Forwarding

This Function in `forward-call.js` will complete 3 steps:

1. Look up the incoming call number using the [Twilio Lookup API]()
1. Send an SMS to the forwarding number with Caller ID information
1. Forward the incoming call to a number that is set in the environment variables.

**Note: `caller-name` lookup is currently only available in the US.**

### Environment variables

This Function expects one environment variable to be set.

| Variable          | Meaning                                                                                                                                                              |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MY_PHONE_NUMBER` | The number you want to forward incoming messages to [in E.164 format](https://support.twilio.com/hc/en-us/articles/223183008-Formatting-International-Phone-Numbers) |

### Parameters

This Function expects the incoming request to be a messaging webhook. The parameters that will be used are `From` and `Body`.
