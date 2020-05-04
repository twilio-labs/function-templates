/**
 *  Create Stripe Payment Link
 *
 *  This function shows you how to programmatically create an invoice when your customer send you an SMS
 *  with `DONATE <AMOUNT> <CURRENCY>`.
 *
 *  Pre-requisites:
 *  - Enable ACCOUNT_SID and AUTH_TOKEN in your functions configuration (https://www.twilio.com/console/functions/configure)
 *  - Add STRIPE_SECRET_KEY to your environment variables (https://www.twilio.com/console/functions/configure)
 *  - Add stripe to your NPM package dependencies (https://www.twilio.com/console/functions/configure)
 */
const Stripe = require('stripe');

// Format the amount for usage with Stripe.
// Detect and handle zero-decimal currencies.
const formatAmountForStripe = ({ amount, currency }) => {
  amount = parseInt(amount);
  const numberFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = true;
  for (let part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false;
    }
  }
  amount = zeroDecimalCurrency ? amount : amount * 100;
  return amount;
};

exports.handler = async function (context, event, callback) {
  const content = event.Body.split(' ');
  const action = content[0].toUpperCase();
  const amount = content[1];
  // Default to USD if no currency code is prvided.
  const currency = content[2] ? content[2].toUpperCase() : 'USD';

  if (action === 'DONATE') {
    const stripe = Stripe(context.STRIPE_SECRET_KEY);
    try {
      // Create a customer object with their phone number.
      const customer = await stripe.customers.create({
        description: 'SMS customer via Twilio',
        phone: event.From,
      });
      // Create the invoice with the amount from the SMS body.
      await stripe.invoiceItems.create({
        customer: customer.id,
        amount: formatAmountForStripe({ amount, currency }),
        currency,
        description: `${action} ${amount} ${currency}`,
      });
      const invoice = await stripe.invoices.create({
        customer: customer.id,
        auto_advance: false,
      });
      await stripe.invoices.finalizeInvoice(invoice.id);
      // Simply return a 200 OK message by calling `callback()`.
      // You could return an SMS TWIML here to return the payment link immediately.
      // In this example we do this in a separate function called `send-invoice-sms.js`,
      // based on a webhook trigger from Stripe.
      // This allows us to also send SMS links for invoices that were created in the Stripe Dashboard:
      // https://stripe.com/docs/billing/invoices/create#without-code
      callback();
    } catch (error) {
      // Respond with error message
      console.log({ error });
      callback(error);
    }
  } else {
    // Unhandled action, simply return
    callback();
  }
};
