# Twilio Verify - Start Verification

This Function shows you how to send a verification token for [Twilio Verify]().

## Pre-requisites

 *  [Create a Verify Service](https://www.twilio.com/console/verify/services)
 *  Add `VERIFY_SERVICE_SID` from above to your [Environment Variables](https://www.twilio.com/console/functions/configure)
 *  Enable `ACCOUNT_SID` and `AUTH_TOKEN` in your [functions configuration](https://www.twilio.com/console/functions/configure)

## Environment variables

This Function expects the following environment variables:

| Variable             | Meaning                                                            | Required |
| :------------------- | :----------------------------------------------------------------- | :------- |
| `VERIFY_SERVICE_SID` | Create one [here](https://www.twilio.com/console/runtime/api-keys) | Yes      |

## Parameters

| Parameter            | Description     | Required |
| :------------------- | :---------------| :------- |
| `country_code`       |                 | Yes      |
| `phone_number`       |                 | Yes      |
| `channel`            | 'sms' or 'call' | No       |
