const helpers = require('../../test/test-helper');
const {
  parseBodyToColumns,
  handler,
  zipColumns,
} = require('../functions/write-to-db');
const Twilio = require('twilio');

const textContext = {};

describe('notion-twilio/write-to-db', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  test('parses the string with 2 elements', (done) => {
    const event = { Body: 'hi,hello' };
    const columns = parseBodyToColumns(event, 3);
    expect(columns).toEqual(['hi', 'hello']);
    done();
  });

  test('parses the string with 3 elements', (done) => {
    const event = { Body: 'hi,hello,hey' };
    const columns = parseBodyToColumns(event, 3);
    expect(columns).toEqual(['hi', 'hello', 'hey']);
    done();
  });

  test('truncates the columns whent there are 4 elements', (done) => {
    const event = { Body: 'hi,hello,hey,ahoy' };
    const columns = parseBodyToColumns(event, 3);
    expect(columns).toEqual(['hi', 'hello', 'hey']);
    done();
  });

  test('combines the column headers and columns as expected with 3 elements', (done) => {
    const columnNames = ['Name', 'Where', 'Price'];
    const columns = ['hi', 'hello', 'hey'];
    const expected = {
      Name: [
        {
          text: {
            content: `hi`,
          },
        },
      ],
      Where: [
        {
          text: {
            content: `hello`,
          },
        },
      ],
      Price: [
        {
          text: {
            content: `hey`,
          },
        },
      ],
    };

    const actual = zipColumns(columnNames, columns);
    expect(actual).toEqual(expected);
    done();
  });

  test('combines the column headers and columns as expected with 2 elements', (done) => {
    const columnNames = ['Name', 'Where', 'Price'];
    const columns = ['hi', 'hello'];
    const expected = {
      Name: [
        {
          text: {
            content: `hi`,
          },
        },
      ],
      Where: [
        {
          text: {
            content: `hello`,
          },
        },
      ],
    };

    const actual = zipColumns(columnNames, columns);
    expect(actual).toEqual(expected);
    done();
  });

  test('combines the column headers and columns as expected with 1 element', (done) => {
    const columnNames = ['Name', 'Where', 'Price'];
    const columns = ['hi'];
    const expected = {
      Name: [
        {
          text: {
            content: `hi`,
          },
        },
      ],
    };

    const actual = zipColumns(columnNames, columns);
    expect(actual).toEqual(expected);
    done();
  });

  test('returns an error if there is no inbound message', (done) => {
    const callback = (_err, result) => {
      expect(result).toBeInstanceOf(Twilio.twiml.MessagingResponse);
      expect(result.toString()).toMatch(
        '<Message>Error: No message provided. Please include a message.</Message>'
      );
      done();
    };

    const event = {};
    handler(textContext, event, callback);
  });

  test('returns the expected message', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch(
        '<Message>Wrote 3 columns: Name, Where, Price to the Notion page!</Message>'
      );
      done();
    };

    const event = { Body: 'hi,hello,hey' };
    handler(textContext, event, callback);
  });

  test('ignores any columns after 3', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch(
        '<Message>Wrote 3 columns: Name, Where, Price to the Notion page!</Message>'
      );
      done();
    };

    const event = { Body: 'hi,hello,hey,ahoy,salutations' };
    handler(textContext, event, callback);
  });
});
