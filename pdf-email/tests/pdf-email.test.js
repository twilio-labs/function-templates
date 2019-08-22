const helpers = require('../../test/test-helper');
const require = jest.mock('require');
const pdf_email = require('../functions/pdf-email').handler;
const Twilio = require('twilio');

const context = {
  SENDGRID_API_KEY: 'APIKEY',
  TO_EMAIL_ADDRESS: 'test_to@example.com',
  FROM_EMAIL_ADDRESS: 'test_from@example.com'
};
const responseStatus = {
  statusCode: 202
};

beforeAll(() => {
  helpers.setup(context);
});

afterAll(() => {
  helpers.teardown();
});

test('returns the email request response body with 202 status code', done => {
  const callback = (err, result) => {
    expect(JSON.parse(result)).toMatchObject(responseStatus);
    done();
  };

  pdf_email(context, responseStatus, callback);
});

test('returns an error when the request fails', done => {
  const callback = (err, result) => {
    expect(err).toBeInstanceOf(Error);
    done();
  };

  request.shouldSucceed = false;

  pdf_email(context, responseStatus, callback);
});
