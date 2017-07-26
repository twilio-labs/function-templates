# Hunt / Find Me

This Function takes an array of numbers and will return the TwiML required to dial each number in order until one answers. This is an initial implementation of the ["Find Me" Twimlet](https://www.twilio.com/labs/twimlets/findme).

## Environment variables

This Function expects one environment variable to be set.

| Variable          | Meaning | Required |
| :---------------- | :------ | :------- |
| `PHONE_NUMBERS` | A comma separated list of numbers [in E.164 format](https://support.twilio.com/hc/en-us/articles/223183008-Formatting-International-Phone-Numbers) that you want to dial in order | Yes |
| `FINAL_URL` | A URL to redirect the call to if none of the numbers answer. If this is not supplied then the call will just hang up once it has exhausted all the options | No |

## Parameters

This Function expects the incoming request to be a voice webhook. The parameters that will be used are `DialCallStatus` and a custom parameter, `nextNumber` that the function itself provides.
