# Twilio Blocklist Call

This function in `blocklist-call.js` allows users to setup a blocklist to reject unwanted phone numbers. See [here](https://support.twilio.com/hc/en-us/articles/360034788313-Reject-Incoming-Calls-with-a-Phone-Number-Blacklist) for a more in-depth guide.

### Environment variables

This Function expects one environment variable to be set.

| Variable    | Meaning                                                                                                                                                                 |
| :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BLOCKLIST` | The comma-separated list of numbers you want to reject [in E.164 format](https://support.twilio.com/hc/en-us/articles/223183008-Formatting-International-Phone-Numbers) |

### Parameters

This Function expects the incoming request to be a voice webhook. The parameters that will be used are `From` and `blocklist`.
