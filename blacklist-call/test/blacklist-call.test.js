const helpers = require('../../test/test-helper');
const blacklistCall = require('../functions/blacklist-call').handler;

const context = {

};

const rejectEvent = {
  blacklist: [ "+12125551234", "+17025556789" ],
  From: "+12125551234"
};

const redirectEvent = {
  blacklist: [ "+12125551234", "+17025556789" ],
  From: "+9999999999"
}

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
  blacklistCall(context, rejectEvent, callback)
});


test('redirects the call', done => {
  const callback = (err, result) => {
    expect(result.toString()).toMatch(/Redirect/);
    done();
  };
  blacklistCall(context, redirectEvent, callback)
});
