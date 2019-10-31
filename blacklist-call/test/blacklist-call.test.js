const helpers = require('../../test/test-helper');
const blacklistCall = require('../functions/blacklist-call').handler;

describe('blacklist in the context', () => {
  const context = {
    BLACKLIST: '+12125551234,+17025556789'
  };

  const event = {
    From: '+12125551234'
  };

  beforeAll(() => {
    helpers.setup(context);
  });

  afterAll(() => {
    helpers.teardown();
  });

  test('rejects the call', done => {
    const callback = (err, result) => {
      expect(result.toString()).toMatch(/Reject/);
      done();
    };
    blacklistCall(context, event, callback);
  });
});

describe('blacklist in the event', () => {
  const rejectEvent = {
    blacklist: '+12125551234,+17025556789',
    From: '+12125551234'
  };

  const redirectEvent = {
    blacklist: '+12125551234,+17025556789',
    From: '+9999999999'
  };

  const emptyBlacklistEvent = {
    blacklist: '',
    From: '+9999999999'
  };

  const emptyContext = {};

  beforeAll(() => {
    helpers.setup(emptyContext);
  });

  afterAll(() => {
    helpers.teardown();
  });

  test('rejects the call', done => {
    const callback = (err, result) => {
      expect(result.toString()).toMatch(/Reject/);
      done();
    };
    blacklistCall(emptyContext, rejectEvent, callback);
  });

  test('redirects the call', done => {
    const callback = (err, result) => {
      expect(result.toString()).toMatch(/Redirect/);
      done();
    };
    blacklistCall(emptyContext, redirectEvent, callback);
  });

  test('redirects the call with empty Blacklist', done => {
    const callback = (err, result) => {
      expect(result.toString()).toMatch(/Redirect/);
      done();
    };
    blacklistCall(emptyContext, emptyBlacklistEvent, callback);
  });
});
