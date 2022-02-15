const helpers = require('../../test/test-helper');
const blocklistCall = require('../functions/blocklist-call.protected').handler;

describe('blocklist in the context', () => {
  const context = {
    BLOCKLIST: '+12125551234,+17025556789',
  };

  const event = {
    From: '+12125551234',
  };

  beforeAll(() => {
    helpers.setup(context);
  });

  afterAll(() => {
    helpers.teardown();
  });

  test('rejects the call', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch(/Reject/);
      done();
    };
    blocklistCall(context, event, callback);
  });
});

describe('blocklist in the event', () => {
  const rejectEvent = {
    blocklist: '+12125551234,+17025556789',
    From: '+12125551234',
  };

  const redirectEvent = {
    blocklist: '+12125551234,+17025556789',
    From: '+9999999999',
  };

  const emptyBlockList = {
    blocklist: '',
    From: '+9999999999',
  };

  const emptyContext = {};

  beforeAll(() => {
    helpers.setup(emptyContext);
  });

  afterAll(() => {
    helpers.teardown();
  });

  test('rejects the call', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch(/Reject/);
      done();
    };
    blocklistCall(emptyContext, rejectEvent, callback);
  });

  test('redirects the call', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch(/Redirect/);
      done();
    };
    blocklistCall(emptyContext, redirectEvent, callback);
  });

  test('redirects the call with empty Blocklist', (done) => {
    const callback = (_err, result) => {
      expect(result.toString()).toMatch(/Redirect/);
      done();
    };
    blocklistCall(emptyContext, emptyBlockList, callback);
  });
});
