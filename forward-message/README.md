# Forward Message

This Function in `forward-message.js` will return the TwiML required to forward an incoming SMS message to a number that is set in the environment variables.

### Environment variables

This Function expects one environment variable to be set.

| Variable          | Meaning                                                                                                                                                              |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MY_PHONE_NUMBER` | The number you want to forward incoming messages to [in E.164 format](https://support.twilio.com/hc/en-us/articles/223183008-Formatting-International-Phone-Numbers) |

### Parameters

This Function expects the incoming request to be a messaging webhook. The parameters that will be used are `From` and `Body`.
