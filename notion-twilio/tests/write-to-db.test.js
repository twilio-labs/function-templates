const helpers = require('../../test/test-helper');
const dbFunction = require('../functions/write-to-db').handler;
const Twilio = require('twilio');

const textContext = {};

describe('notion-twilio/write-to-db', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('returns an error if there is no inbound message', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
      expect(result.toString()).toMatch(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Error: No message provided. Please include a message.</Message></Response>'
      );
      done();
    };

    const event = {};
    dbFunction(textContext, event, callback);
  });

  test('returns the right number of columns when 1 is provided', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch(
        '<Message>Wrote 1 columns: Name to the Notion page!</Message>'
      );
      done();
    };

    const event = { Body: 'hi' };
    dbFunction(textContext, event, callback);
  });

  test('returns the right number of columns when 2 are provided', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch(
        '<Message>Wrote 2 columns: Name, Where to the Notion page!</Message>'
      );
      done();
    };

    const event = { Body: 'hi,hello' };
    dbFunction(textContext, event, callback);
  });

  test('returns the right number of columns when 3 are provided', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch(
        '<Message>Wrote 3 columns: Name, Where, Price to the Notion page!</Message>'
      );
      done();
    };

    const event = { Body: 'hi,hello,hey' };
    dbFunction(textContext, event, callback);
  });

  test('ignores any columns after 3', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch(
        '<Message>Wrote 3 columns: Name, Where, Price to the Notion page!</Message>'
      );
      done();
    };

    const event = { Body: 'hi,hello,hey,ahoy,salutations' };
    dbFunction(textContext, event, callback);
  });
});
