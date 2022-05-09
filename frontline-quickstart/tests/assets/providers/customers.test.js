const {
  findWorkerForCustomer,
  findRandomWorker,
  getCustomerById,
  getCustomersList,
  getCustomerByNumber,
  generateCustomersList,
} = require('../../../assets/providers/customers.private');

const TEST_USERNAME = 'testworker';
const CUSTOMER_1_NUMBER = '+1222333444';
const CUSTOMER_2_NUMBER = '+1222333445';
const context = {
  TWILIO_PHONE_NUMBER: '+1234567890',
  USERNAME: TEST_USERNAME,
  PHONE_NUMBER_FOR_CUSTOMER_1: CUSTOMER_1_NUMBER,
  CUSTOMER_1_NAME: 'Test Customer 1',
  PHONE_NUMBER_FOR_CUSTOMER_2: CUSTOMER_2_NUMBER,
  NAME_FOR_CUSTOMER_2: 'Test Customer 2',
};

test('generateCustomersList', () => {
  const customersList = generateCustomersList(context);
  expect(customersList).toBeDefined();
  expect(customersList.length).toEqual(2);
});

test('getCustomerById', () => {
  const customer = getCustomerById(context, 1);
  expect(customer).toBeDefined();
});

test('getCustomerByNumber', () => {
  const customer = getCustomerByNumber(context, CUSTOMER_1_NUMBER);
  expect(customer).toBeDefined();
});

test('getCustomersList', async (done) => {
  const customers = await getCustomersList(context, TEST_USERNAME);
  expect(customers).toBeDefined();
  expect(customers.length).toEqual(2);
  done();
});

test('getCustomersList: pageSize splits the list', async (done) => {
  let customers = await getCustomersList(context, TEST_USERNAME, 1);
  expect(customers).toBeDefined();
  expect(customers.length).toEqual(1);

  customers = await getCustomersList(context, TEST_USERNAME, 2);
  expect(customers).toBeDefined();
  expect(customers.length).toEqual(2);

  customers = await getCustomersList(context, TEST_USERNAME);
  expect(customers).toBeDefined();
  expect(customers.length).toEqual(2);
  done();
});

test('getCustomersList: pagination returns the right contacts', async (done) => {
  let customers = await getCustomersList(context, TEST_USERNAME, 2, 0);
  expect(customers).toBeDefined();
  expect(customers[0].customer_id).toEqual(1);

  customers = await getCustomersList(context, TEST_USERNAME, 2, 1);
  expect(customers).toBeDefined();
  expect(customers[0].customer_id).toEqual(2);

  done();
});
test('getCustomersList: pageSize splits the list', async (done) => {
  let customers = await getCustomersList(context, TEST_USERNAME, 1);
  expect(customers).toBeDefined();
  expect(customers.length).toEqual(1);

  customers = await getCustomersList(context, TEST_USERNAME, 2);
  expect(customers).toBeDefined();
  expect(customers.length).toEqual(2);

  customers = await getCustomersList(context, TEST_USERNAME);
  expect(customers).toBeDefined();
  expect(customers.length).toEqual(2);
  done();
});

test('findWorkerForCustomer', async (done) => {
  let assignedWorker = await findWorkerForCustomer(context, CUSTOMER_1_NUMBER);
  expect(assignedWorker).toBeDefined();

  assignedWorker = await findWorkerForCustomer(context, '+0000000');
  expect(assignedWorker).toBeFalsy();

  assignedWorker = await findWorkerForCustomer(context);
  expect(assignedWorker).toBeFalsy();

  done();
});

test('findRandomWorker', async (done) => {
  const assignedWorker = await findRandomWorker(context);
  expect(assignedWorker).toBeDefined();

  done();
});
