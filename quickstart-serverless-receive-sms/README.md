# quickstart-serverless-receive-sms

This template application contains all sample code for a user to follow along the [Receive an inbound SMS](https://www.twilio.com/docs/serverless/functions-assets/quickstart/receive-sms) quickstart guide.

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. A file named `.env` is used to store the values for those environment variables. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable | Description | Required |
| :------- | :---------- | :------- |
| TWILIO_PHONE_NUMBER | A Twilio phone number |
| MY_PHONE_NUMBER | The phone number to forward test messages to | Yes |

### Function Parameters

Each Function expects the incoming request to be a messaging webhook. The specifics vary between each example, but at most, the parameters that will be used are `From` and `Body`.
