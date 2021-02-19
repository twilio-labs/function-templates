# Forward SMS message as an email (Mailgun)

This function will forward incoming SMS messages to an email address using the [Mailgun API](https://documentation.mailgun.com/en/latest/api_reference.html).

You will need a Mailgun account and an [API key](https://app.mailgun.com/app/account/security/api_keys) to use this Function. You can find your API key in the settings area of your mailgun account.

### Environment Variables

This Function expects four environment variables to be set. You should configure these in your [Functions configuration page](https://www.twilio.com/console/runtime/functions/configure)

| Variable             | Meaning                                                   |
| :------------------- | :-------------------------------------------------------- |
| `MAILGUN_API_KEY`    | Your Mailgun API key                                      |
| `MG_VERIFIED_DOMAIN` | Your Mailgun verified domain you want to send emails from |
| `TO_EMAIL_ADDRESS`   | The email address to forward the message to               |
| `FROM_EMAIL_ADDRESS` | The email address that Mailgun should send the email from |

### Dependencies

This Function depends on one npm module. You should add the following dependencies in your [Functions configuration page](https://www.twilio.com/console/runtime/functions/configure).

| Dependency   | Version |
| :----------- | :------ |
| `mailgun-js` | 0.22.0  |

### Parameters

This Function expects the incoming request to be a messaging webhook. The parameters that will be used are `From` and `Body`.
