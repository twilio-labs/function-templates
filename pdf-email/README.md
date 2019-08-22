# Create and send PDF on the fly via Twilio Sendgrid

This Function shows you how to create a PDF on the fly within the function and retrieve it and finally send it via email attachment.

The important bit is that this Function shows you have to use the temporary storage where the file is created by default. Keep in mind that this is for single invocations as the /tmp/ directory gets deleted so it's not meant for long term storage


## Environment variables

This Function requires the following environment variables set:

| Variable           | Meaning                                                                           
| :----------------- | :-------------------------------------------------------------------------------- |
| `SENDGRID_API_KEY` | Your Twilio Sendgrid API key. Follow the process here https://sendgrid.com/docs/for-developers/sending-email/api-getting-started/                                                                          
| `TO_EMAIL_ADDRESS` |  The origin email address                                                         
| `FROM_EMAIL_ADDRESS`| The destination email address                                                    

## Parameters

This Function doesn't expect any parameters passed.
