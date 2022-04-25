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

  // Respond with Customers object
  return {
    objects: {
      customers: customersList,
    },
  };
};

const handleGetCustomerDetailsByCustomerIdCallback = async (event, context) => {
  const customersFile = Runtime.getAssets()['/providers/customers.js'].path;
  const { getCustomerById } = require(customersFile);
  console.log('Getting Customer details: ', event.CustomerId);

  const customerId = event.CustomerId;

  /**
   *  Fetch Customer Details based on their ID
   * and information about a worker, that requested that information
   */
  const customerDetails = getCustomerById(context, customerId);

  // Respond with Contact object
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

exports.handler = async function (context, event, callback) {
  const location = event.Location;

  /**
   * Location helps to determine which information was requested.
   * CRM callback is a general purpose tool and might be used to fetch different kind of information
   */
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
