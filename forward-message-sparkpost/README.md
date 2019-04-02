# Forward SMS message as an email (Sparkpost)

This Function will forward incoming SMS messages to an email address using the [SparkPost API](https://www.sparkpost.com/).

You will need a SparkPost account and an [API key](https://app.sparkpost.com/account/credentials) to use this Function.

### The SparkPost Sandbox

If you are testing out with SparkPost you can [use their sandbox domain to send test emails](https://developers.sparkpost.com/api/transmissions/#header-the-sandbox-domain). To do so you should set your `FROM_EMAIL_ADDRESS` to "anything@sparkpostbox.com" and set `options.sandbox` to `true`.

This code example includes the `sandbox` option. Ensure you set it to `false` or remove it when you change to use your own domain.

### Environment Variables

This Function expects three environment variables to be set.

| Variable             | Meaning                                                     |
| :------------------- | :---------------------------------------------------------- |
| `SPARKPOST_API_KEY`  | Your SparkPost API key                                      |
| `TO_EMAIL_ADDRESS`   | The email address to forward the message to                 |
| `FROM_EMAIL_ADDRESS` | The email address that SparkPost should send the email from |

### Dependencies

This Function depends on one npm module. You should add the following dependencies in your [Functions configuration page](https://www.twilio.com/console/runtime/functions/configure).

| Dependency | Version |
| :--------- | :------ |
| `got`      | ^6.7.1  |
