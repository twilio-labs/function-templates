const helpers = require('../../test/test-helper');
const blockSpamCalls =
  require('../functions/block-spam-calls.protected').handler;
const Twilio = require('twilio');

let context = {};
let event = {};

beforeAll(() => {
  helpers.setup(context);
});

afterEach(() => {
  context = {};
  event = {};
});

afterAll(() => {
  helpers.teardown();
});

test('returns a VoiceResponse', (done) => {
  const callback = (_err, result) => {
    expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
    done();
  };

  blockSpamCalls(context, event, callback);
});

describe('call flagged as spam and rejected', () => {
  const nomoroboSpamEvent = {
    AddOns: JSON.stringify(require('./spam-filter-results/spam-nomorobo.json')),
  };
  const marchexSpamEvent = {
    AddOns: JSON.stringify(require('./spam-filter-results/spam-marchex.json')),
  };

  beforeAll(() => {
    helpers.setup(context);
  });

  afterAll(() => {
    helpers.teardown();
  });

  test('flagged spam by nomorobo', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch(/Reject/);
      done();
    };
    blockSpamCalls(context, nomoroboSpamEvent, callback);
  });

  test('flagged spam by marchex', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch(/Reject/);
      done();
    };
    blockSpamCalls(context, marchexSpamEvent, callback);
  });
});

describe('call not flagged as spam', () => {
  const failedNomoroboEvent = {
    AddOns: JSON.stringify(
      require('./spam-filter-results/failed-nomorobo.json')
    ),
  };
  const cleanNomoroboEvent = {
    AddOns: JSON.stringify(
      require('./spam-filter-results/clean-nomorobo.json')
    ),
  };
  const cleanMarchexEvent = {
    AddOns: JSON.stringify(require('./spam-filter-results/clean-marchex.json')),
  };
  const noAddonsEvent = {};

  beforeAll(() => {
    helpers.setup(context);
  });

  afterAll(() => {
    helpers.teardown();
  });

  test('flagged clean by nomorobo', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch(/<Say>Welcome to the jungle./);
      done();
    };
    blockSpamCalls(context, cleanNomoroboEvent, callback);
  });

  test('flagged clean by marchex', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch(/<Say>Welcome to the jungle./);
      done();
    };
    blockSpamCalls(context, cleanMarchexEvent, callback);
  });

  test('failed nomorobo response (call goes through)', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch(/<Say>Welcome to the jungle./);
      done();
    };
    blockSpamCalls(context, failedNomoroboEvent, callback);
  });

  test('No addons present (call goes through)', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch(/<Say>Welcome to the jungle./);
      done();
    };
    blockSpamCalls(context, noAddonsEvent, callback);
  });
});
