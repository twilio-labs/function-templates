/* eslint-disable camelcase */
const handleGetCustomersListCallback = async (context, event) => {
  const customersFile = Runtime.getAssets()['/providers/customers.js'].path;
  const { getCustomersList } = require(customersFile);

  console.log('Getting Customers list');

  const workerIdentity = event.Worker;
  const pageSize = event.PageSize;
  const anchor = event.Anchor || 0;

  console.log('worker identity: ', workerIdentity);

  // Fetch Customers list based on information about a worker, that requested it
  const customersList = await getCustomersList(
    context,
    workerIdentity,
    pageSize,
    anchor
  );

  /**
   * Respond with a Customers object list
   * https://www.twilio.com/docs/frontline/data-transfer-objects#customer
   */
  return {
    objects: {
      customers: customersList,
    },
  };
};

const handleGetCustomerDetailsByCustomerIdCallback = async (event, context) => {
  const customersFile = Runtime.getAssets()['/providers/customers.js'].path;
  const { getCustomerById } = require(customersFile);
  const customerId = event.CustomerId;

  console.log('Getting Customer details for ID: ', event.CustomerId);

  /**
   * Fetch Customer details based on their ID
   * and information about a worker, that requested that information
   */
  const customerDetails = getCustomerById(context, customerId);

  /**
   * Respond with Customer object
   * Read more: https://www.twilio.com/docs/frontline/data-transfer-objects#customer
   */
  return {
    objects: {
      customer: {
        customer_id: customerDetails.customer_id,
        display_name: customerDetails.display_name,
        channels: customerDetails.channels,
        links: customerDetails.links,
        avatar: customerDetails.avatar,
        details: customerDetails.details,
      },
    },
  };
};

/**
 * CRM Callback Handler
 * Read more: https://www.twilio.com/docs/frontline/my-customers
 */
exports.handler = async function (context, event, callback) {
  console.log('[ CRM Callback ]');

  /**
   * Location helps to determine which information was requested.
   * This callback is used to fetch different types of information.
   * Read more: https://www.twilio.com/docs/frontline/my-customers#responding-to-the-crm-callback
   */
  const location = event.Location;

  switch (location) {
    case 'GetCustomerDetailsByCustomerId': {
      const resp = await handleGetCustomerDetailsByCustomerIdCallback(
        event,
        context
      );
      return callback(null, resp);
    }
    case 'GetCustomersList': {
      const resp = await handleGetCustomersListCallback(context, event);
      return callback(null, resp);
    }

    default: {
      console.log('Unknown location: ', location);
      const response = new Twilio.Response();
      response.setStatusCode(422);
      response.setBody(`Unknown location: ${location}`);

      return callback(null, response);
    }
  }
};
