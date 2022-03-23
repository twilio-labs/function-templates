/* eslint-disable camelcase */
/**
 * Generates a static list of customers based on the information provided through env vars
 */
const generateCustomersList = (context) => {
  const customers = [];

  if (
    context.PHONE_NUMBER_FOR_CUSTOMER_1 &&
    context.NAME_FOR_CUSTOMER_1 &&
    context.WORKER_USERNAME
  ) {
    customers.push({
      customer_id: 1,
      display_name: context.NAME_FOR_CUSTOMER_1,
      channels: [
        { type: 'email', value: 'customer_test_1@example.com' },
        { type: 'sms', value: context.PHONE_NUMBER_FOR_CUSTOMER_1 },
        // { type: 'whatsapp', value: 'whatsapp:+1234567890' }, // TODO: figure out Whatsapp
      ],
      links: [
        {
          type: 'Facebook',
          value: 'https://facebook.com',
          display_name: 'Social Media Profile',
        },
      ],
      worker: context.WORKER_USERNAME,
    });
  }

  if (
    context.PHONE_NUMBER_FOR_CUSTOMER_2 &&
    context.NAME_FOR_CUSTOMER_2 &&
    context.WORKER_USERNAME
  ) {
    customers.push({
      customer_id: 2,
      display_name: context.NAME_FOR_CUSTOMER_2,
      channels: [
        { type: 'email', value: 'customer_test_2@example.com' },
        { type: 'sms', value: context.PHONE_NUMBER_FOR_CUSTOMER_2 },
        // { type: 'whatsapp', value: 'whatsapp:+1234567890' }, TODO
      ],
      links: [
        {
          type: 'Facebook',
          value: 'https://facebook.com',
          display_name: 'Social Media Profile',
        },
      ],
      worker: context.WORKER_USERNAME,
    });
  }

  return customers;
};

const findWorkerForCustomer = async (context, customerNumber) => {
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

const findRandomWorker = async () => {
  const uniqueWorkers = [];

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

  console.log('list', list);

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

const getCustomerByNumber = async (context, customerNumber) => {
  const customers = generateCustomersList(context);

  return customers.find((customer) =>
    customer.channels.find(
      (channel) => String(channel.value) === String(customerNumber)
    )
  );
};

const getCustomerById = async (context, customerId) => {
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
};
