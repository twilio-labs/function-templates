# Forward SMS message as an email

This set of Functions will receive an incoming SMS message and forward the message to an email address.

There are different Functions for different email service providers. The Function is named after the provider.

## SparkPost

The SparkPost Function will forward incoming SMS messages to an email address using the [SparkPost API](https://www.sparkpost.com/).

You will need a SparkPost account and an [API key](https://app.sparkpost.com/account/credentials) to use this Function.

### Environment Variables

This Function expects three environment variables to be set.

| Variable             | Meaning |
| :------------------- | :------ |
| `SPARKPOST_API_KEY`  | Your SparkPost API key |
| `TO_EMAIL_ADDRESS`   | The email address to forward the message to |
| `FROM_EMAIL_ADDRESS` | The email address that SparkPost should send the email from |



