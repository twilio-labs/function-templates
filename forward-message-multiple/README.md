# Forward Message to Multiple Numbers

This Function in `forward-message-multiple.js` will return the TwiML required to forward an incoming SMS message to each number in a comma separated list of numbers set in the environment variables.

### Environment variables

This Function expects one environment variable to be set.

| Variable             | Meaning                                                                                                                                                                                          |
| :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FORWARDING_NUMBERS` | A list of numbers [in E.164 format](https://support.twilio.com/hc/en-us/articles/223183008-Formatting-International-Phone-Numbers) you want to forward incoming messages to, separated by commas |

### Parameters

This Function expects the incoming request to be a messaging webhook. The parameters that will be used are `From` and `Body`.
