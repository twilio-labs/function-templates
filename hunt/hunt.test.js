const helpers = require('../test/test-helper');
const hunt = require('./hunt').handler;
const Twilio = require('twilio');

const context = {
  PHONE_NUMBERS: '+1234567890,+10987654321'
};

const setupLifeCycle = context => {
  beforeAll(() => {
    helpers.setup(context);
  });
  afterAll(() => {
    helpers.teardown();
  });
};

describe('a completed call', () => {
  const event = {
    DialCallStatus: 'complete'
  };

  setupLifeCycle(context);

  test('returns a VoiceResponse', done => {
    const callback = (err, result) => {
      expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
      done();
    };

    hunt(context, event, callback);
  });

  test('returns a hangup', done => {
    const callback = (err, result) => {
      expect(result.toString()).toMatch('<Hangup/>');
      done();
    };

    hunt(context, event, callback);
  });
});

describe('the first call', () => {
  const event = {};

  setupLifeCycle(context);

  test('returns a VoiceResponse', done => {
    const callback = (err, result) => {
      expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
      done();
    };

    hunt(context, event, callback);
  });

  test('returns a dial to the first number', done => {
    const callback = (err, result) => {
      const xml = result.toString();
      expect(xml).toMatch('<Dial');
      expect(xml).toMatch('<Number');
      expect(xml).toMatch('>+1234567890<');
      done();
    };

    hunt(context, event, callback);
  });

  test('sets the next number to dial in the url', done => {
    const callback = (err, result) => {
      const xml = result.toString();
      expect(xml).toMatch('/hunt?nextNumber=%2B10987654321');
      done();
    };

    hunt(context, event, callback);
  });
});

describe('a subsequent call', () => {
  const context = {
    PHONE_NUMBERS: '+1234567890, +10987654321 '
  };
  const event = {
    nextNumber: '+10987654321'
  };

  setupLifeCycle(context);

  test('returns a VoiceResponse', done => {
    const callback = (err, result) => {
      expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
      done();
    };

    hunt(context, event, callback);
  });

  test('returns a dial to the next number', done => {
    const callback = (err, result) => {
      const xml = result.toString();
      expect(xml).toMatch('<Dial');
      expect(xml).toMatch('<Number');
      expect(xml).toMatch('>+10987654321<');
      done();
    };

    hunt(context, event, callback);
  });

  test('sets the url to finished', done => {
    const callback = (err, result) => {
      const xml = result.toString();
      expect(xml).toMatch('/hunt?finished=true');
      done();
    };

    hunt(context, event, callback);
  });
});

describe('the last call', () => {
  const event = {
    finished: 'true'
  };

  describe('with no final url set', () => {
    setupLifeCycle(context);

    test('returns a VoiceResponse', done => {
      const callback = (err, result) => {
        expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
        done();
      };

      hunt(context, event, callback);
    });

    test('returns a hangup', done => {
      const callback = (err, result) => {
        expect(result.toString()).toMatch('<Hangup/>');
        done();
      };

      hunt(context, event, callback);
    });
  });

  describe('with a final url set', () => {
    const context = {
      PHONE_NUMBERS: '+1234567890,+10987654321',
      FINAL_URL: '/no-answer'
    };

    setupLifeCycle(context);

    test('returns a VoiceResponse', done => {
      const callback = (err, result) => {
        expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
        done();
      };

      hunt(context, event, callback);
    });

    test('returns a redirect', done => {
      const callback = (err, result) => {
        const xml = result.toString();
        expect(xml).toMatch('<Redirect>');
        expect(xml).toMatch(context.FINAL_URL);
        done();
      };

      hunt(context, event, callback);
    });
  });
});
