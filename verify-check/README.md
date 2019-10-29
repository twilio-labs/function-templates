# Twilio Verify - Check Verification

This Function shows you how to check a verification token for [Twilio Verify](https://www.twilio.com/docs/verify/api/verification-check).

## Pre-requisites

 *  [Create a Verify Service](https://www.twilio.com/console/verify/services)
 *  Add `VERIFY_SERVICE_SID` from above to your [Environment Variables](https://www.twilio.com/console/functions/configure)
 *  Enable `ACCOUNT_SID` and `AUTH_TOKEN` in your [functions configuration](https://www.twilio.com/console/functions/configure)

## Environment variables

This Function expects the following environment variables set in [function configuration](https://www.twilio.com/console/functions/configure):

| Variable             | Meaning                                                            | Required |
| :------------------- | :----------------------------------------------------------------- | :------- |
| `VERIFY_SERVICE_SID` | Create one [here](https://www.twilio.com/console/verify/services)  | Yes      |

## Parameters

This Function expects the following parameters:

| Parameter            | Description       | Required |
| :------------------- | :-----------------| :------- |
| `phone_number`       | E.164 formatted   | Yes      |
| `verification_code`  | Collect from user | Yes      |