# Forward Call

This Function in `forward-call.js` will return the [TwiML](https://www.twilio.com/docs/voice/twiml) required to forward an incoming call to a number that is set in the environment variables.

### Environment variables

This Function expects one environment variable to be set.

| Variable          | Meaning                                                                                                                                                              |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MY_PHONE_NUMBER` | The number you want to forward incoming calls to [in E.164 format](https://help.twilio.com/articles/223183008-Formatting-International-Phone-Numbers) |

### Parameters

This Function expects the incoming request to be a messaging webhook. The parameters that will be used are `From` and `Body`.
