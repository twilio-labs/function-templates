/* eslint-disable camelcase */
/**
 * Generates a static list of customers based on the information provided through env vars
 */
const generateCustomersList = (context) => {
  const CUSTOMER_1_NAME = 'Example Customer 1';
  const CUSTOMER_2_NAME = 'Example Customer 2';
  const customers = [];

  if (context.EXAMPLE_CUSTOMER_1_PHONE_NUMBER && context.SSO_USERNAME) {
    customers.push({
      customer_id: 1,
      display_name: CUSTOMER_1_NAME,
      channels: [
        { type: 'email', value: 'customer_test_1@example.com' },
        { type: 'sms', value: context.EXAMPLE_CUSTOMER_1_PHONE_NUMBER },
        // { type: 'whatsapp', value: 'whatsapp:+1234567890' }, // TODO: figure out Whatsapp
      ],
      links: [
        {
          type: 'Facebook',
          value: 'https://facebook.com',
          display_name: 'Social Media Profile',
        },
      ],
      details: {
        title: 'More information',
        content:
          'This a static example customer. When your app is connected to a CRM, it will pull data from the system.',
      },
      worker: context.SSO_USERNAME,
      address: context.EXAMPLE_CUSTOMER_1_PHONE_NUMBER,
    });
  }

  if (
    context.EXAMPLE_CUSTOMER_2_PHONE_NUMBER &&
    context.EXAMPLE_CUSTOMER_2_PHONE_NUMBER !== '""' && // when input is left empty, QuickDeploy sends '""'
    context.SSO_USERNAME
  ) {
    customers.push({
      customer_id: 2,
      display_name: CUSTOMER_2_NAME,
      channels: [
        { type: 'email', value: 'customer_test_2@example.com' },
        { type: 'sms', value: context.EXAMPLE_CUSTOMER_2_PHONE_NUMBER },
        // { type: 'whatsapp', value: 'whatsapp:+1234567890' }, TODO
      ],
      links: [
        {
          type: 'Facebook',
          value: 'https://facebook.com',
          display_name: 'Social Media Profile',
        },
      ],
      details: {
        title: 'More information',
        content:
          'This is a static example customer. When your app is connected to a CRM, it will pull data from the system.',
      },
      worker: context.SSO_USERNAME,
      address: context.EXAMPLE_CUSTOMER_2_PHONE_NUMBER,
    });
  }

  return customers;
};

const findWorkerForCustomer = async (context, customerNumber) => {
  if (!customerNumber) {
    return null;
  }

  const customers = generateCustomersList(context);

  const workerForCustomer = customers.filter((customer) => {
    if (customerNumber.includes(customer.address)) {
      return customer;
    }
    return null;
  });

  if (workerForCustomer.length > 0) {
    return workerForCustomer[0].worker;
  }

  return null;
};

const findRandomWorker = async (context) => {
  const uniqueWorkers = [];
  const customers = generateCustomersList(context);
  for (const customer of customers) {
    console.log(customer.worker);
    if (!uniqueWorkers.includes(customer.worker)) {
      uniqueWorkers.push(customer.worker);
    }
  }

  const randomIndex = Math.floor(Math.random() * uniqueWorkers.length);
  return uniqueWorkers[randomIndex];
};

const getCustomersList = async (context, worker, pageSize, anchor) => {
  const customers = generateCustomersList(context);

  const workerCustomers = customers.filter(
    (customer) => customer.worker === worker
  );
  const list = workerCustomers.map((customer) => ({
    display_name: customer.display_name,
    customer_id: customer.customer_id,
    avatar: customer.avatar,
  }));

  if (!pageSize) {
    return list;
  }

  if (anchor) {
    const lastIndex = list.findIndex(
      (c) => String(c.customer_id) === String(anchor)
    );
    const nextIndex = lastIndex + 1;
    return list.slice(nextIndex, nextIndex + pageSize);
  }
  return list.slice(0, pageSize);
};

const getCustomerByNumber = (context, customerNumber) => {
  const customers = generateCustomersList(context);

  return customers.find((customer) =>
    customer.channels.find(
      (channel) => String(channel.value) === String(customerNumber)
    )
  );
};

const getCustomerById = (context, customerId) => {
  const customers = generateCustomersList(context);

  return customers.find(
    (customer) => String(customer.customer_id) === String(customerId)
  );
};

module.exports = {
  findWorkerForCustomer,
  findRandomWorker,
  getCustomerById,
  getCustomersList,
  getCustomerByNumber,
  generateCustomersList,
};
