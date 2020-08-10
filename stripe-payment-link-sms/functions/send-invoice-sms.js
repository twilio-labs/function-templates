/**
 *  Send Stripe Payment Link SMS
 *
 *  This function shows you how to programmatically send an invoice payment link URL to your customer via SMS,
 *  using a Stripe webhook event as trigger.
 *
 *  Pre-requisites:
 *  - Enable ACCOUNT_SID and AUTH_TOKEN in your functions configuration (https://www.twilio.com/console/functions/configure)
 *  - Add STRIPE_SECRET_KEY to your environment variables (https://www.twilio.com/console/functions/configure)
 *  - Add stripe to your NPM package dependencies (https://www.twilio.com/console/functions/configure)
 */
const Stripe = require('stripe');

exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  // Only handle invoice.finalized events
  if (event.type === 'invoice.finalized') {
    // Retrieve the event object from Stripe to verify its validity.
    // If you're running your own server environment you can verify
    // the webhook signature instead:
    // https://stripe.com/docs/webhooks/signatures#verify-official-libraries
    try {
      // To use stripe in your Twilio function you need to add it in the dependencies
      // section of your functions config: https://www.twilio.com/console/functions/configure.
      const stripe = Stripe(context.STRIPE_SECRET_KEY);
      const stripeEvent = await stripe.events.retrieve(event.id);
      const invoice = await stripe.invoices.retrieve(
        stripeEvent.data.object.id
      );
      // Check that the invoce has a phone number set.
      if (invoice.customer_phone) {
        // Send the invoice payment link URL to the customer.
        const client = context.getTwilioClient();
        const message = await client.messages.create({
          to: invoice.customer_phone,
          from: context.TWILIO_PHONE_NUMBER || 'STRIPEDEMO',
          body: `Thanks for your donation ❤️ Here is your payment link: ${invoice.hosted_invoice_url}`,
        });
        console.log(`Sending SMS. Message sid: ${message.sid}`);
      } else {
        console.log('No phone number found for this customer/charge.');
      }
    } catch (error) {
      console.log(error.message);
      // Respond with status code 400 so Stripe will retry the request:
      // https://stripe.com/docs/webhooks/best-practices#retry-logic.
      response.setStatusCode(400);
      callback(null, response);
      return;
    }
  }

  // Simply acknowledge unhandled events with 200 status,
  // otherwise Stripe will retry the webhook event.
  response.setStatusCode(200);
  callback(null, response);
};
