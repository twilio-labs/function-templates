# Stripe SMS Receipt Webhook Handler

This function shows you how to programmatically send a payment receipt URL to your customer via SMS using a [Stripe webhook event](https://stripe.com/docs/webhooks) as trigger.

![Stripe SMS receipt demo gif](https://github.com/thorsten-stripe/demo-gifs/blob/master/twilio-stripe-sms-receipt.gif?raw=true)

## Create a new project with this template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [Twilio Serverless Toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init twilio-stripe-sample --template=stripe-sms-receipt && cd twilio-stripe-sample
```

4. Install the dependencies for local testing

```shell
npm install
```

## Testing locally

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable            | Meaning                                                                                | Required                     |
| :------------------ | :------------------------------------------------------------------------------------- | :--------------------------- |
| `ACCOUNT_SID`       | Find in the [console](https://www.twilio.com/console)                                  | Yes                          |
| `AUTH_TOKEN`        | Find in the [console](https://www.twilio.com/console)                                  | Yes                          |
| `STRIPE_SECRET_KEY` | Find in your [Stripe Dahsboard](https://dashboard.stripe.com/test/apikeys)             | Yes                          |
| `FROM_PHONE`        | Needs to be [configured](https://www.twilio.com/console/phone-numbers/getting-started) | Maybe (depending on country) |

### Using the Stripe CLI

Using the [Stripe CLI](https://github.com/stripe/stripe-cli#stripe-cli) we can execute [predefined fixtures](stripe_fixtures/create_customer_and_payment.json) to run a sequence of requests (in this case create a customer and then create a payment), and also we can [forward](https://github.com/stripe/stripe-cli/wiki/listen-command) Stripe webhook events to our local server running the Twilio function.

1. Install the [Stripe CLI](https://github.com/stripe/stripe-cli#installation) & [login](https://github.com/stripe/stripe-cli/wiki/login-command) with your Stripe account.
2. Replace `+12025551212` with your phone number for testing in the [stripe_fixtures/create_customer_and_payment.json](stripe_fixtures/create_customer_and_payment.json) file. Be sure to follow the [E.164 format](https://www.twilio.com/docs/glossary/what-e164).
3. Start the server with the Twilio CLI:

```shell
twilio serverless:start
```

4. In a separate terminal window, start the webhook event forwarding:

```shell
stripe listen --forward-to http://localhost:3000/send-sms-receipt
```

5. In a third terminal window, trigger the Stripe fixtures:

```shell
stripe fixtures assets/stripe_fixtures/create_customer_and_payment.private.json
```

6. Monitor the Twilio CLI logs for errors, otherwise monitor your phone for incoming messages 🎉

## Deploying

To run your function on Twilio, you need to:

- Enable `ACCOUNT_SID` and `AUTH_TOKEN` in your [functions configuration](https://www.twilio.com/console/functions/configure).
- Add your `STRIPE_SECRET_KEY` to your [environment variables](https://www.twilio.com/console/functions/configure).
- Add `stripe` to your NPM package [dependencies](https://www.twilio.com/console/functions/configure). You can find the latest `stripe-node` version number on [GitHub](https://github.com/stripe/stripe-node/blob/master/VERSION).

Deploy your function with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart). Note: you must run this from inside your project folder.

```
twilio serverless:deploy
```

After deploying, copy the deployment URL with the webhook path (something along the lines of: https://stripe-sms-receipt-1234-dev.twil.io/send-sms-receipt) and create a live webhook endpoint [in your Stripe dashboard](https://stripe.com/docs/webhooks/setup#configure-webhook-settings).
