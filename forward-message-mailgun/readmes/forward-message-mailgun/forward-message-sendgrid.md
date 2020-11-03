# Forward SMS message as an email (SendGrid)

The SendGrid Function will forward incoming SMS messages to an email address using the [SendGrid API](https://sendgrid.com/).

You will need a SendGrid account and an [API key](https://app.sendgrid.com/settings/api_keys) to use this Function.

### Environment Variables

This Function expects three environment variables to be set.

| Variable             | Meaning                                                    |
| :------------------- | :--------------------------------------------------------- |
| `SENDGRID_API_KEY`   | Your SendGrid API key                                      |
| `TO_EMAIL_ADDRESS`   | The email address to forward the message to                |
| `FROM_EMAIL_ADDRESS` | The email address that SendGrid should send the email from |

### Dependencies

This Function depends on one npm module. You should add the following dependencies in your [Functions configuration page](https://www.twilio.com/console/runtime/functions/configure).

| Dependency | Version |
| :--------- | :------ |
| `got`      | 6.7.1  |

### Parameters

This Function expects the incoming request to be a messaging webhook. The parameters that will be used are `From` and `Body`.
