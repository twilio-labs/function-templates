# Twilio Video Token

This Function shows you how to mint [Access Token](https://www.twilio.com/docs/iam/access-tokens) for [Twilio Video](https://www.twilio.com/video). Please note, this is for prototyping purposes only. You will want to validate the identity of clients requesting Access Token in most production applications and set the identity when minting the Token.

## IMPORTANT!

Make sure you to change the `IDENTITY` and `ROOM` variables in the Function to your needs and verify the identity of the user you are generating the access token for.

## Environment variables

This Function expects the following environment variables set:

| Variable     | Meaning                                                                           | Required |
| :----------- | :-------------------------------------------------------------------------------- | :------- |
| `API_KEY`    | Twilio API Key. Create one here (https://www.twilio.com/console/runtime/api-keys) | Yes      |
| `API_SECRET` | Twilio API Secret corresponding to your API Key                                   | Yes      |

## Parameters

This Function doesn't expect any parameters passed.
