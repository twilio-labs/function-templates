const funlet = require('./funlet-echo').handler;
const Twilio = require('twilio');
const TWIML = '<Response><Say>echo okay</Say></Response>';

function expectTwiml(result, Twiml) {
  expect( result ).toBeInstanceOf( Twilio.Response );
  expect( result.statusCode ).toBe( 200 );
  expect( result.body ).toBe( TWIML );
  expect( result.headers['Content-Type'] ).toBe( 'text/xml' );
}

test.skip('[Echo-1.1] Echo (GET)', done => {
  const callback = (err, result) => {
    expectTwiml(result, TWIML);
    done();
  };
  funlet({}, {Twiml:TWIML}, callback);
});

test.skip('[Echo-1.2] Echo (ENV)', done => {
  const callback = (err, result) => {
    expectTwiml(result, TWIML);
    done();
  };
  funlet({ECHO_TWIML:TWIML}, {}, callback);
});

test.skip('[Echo-1.3] Echo (Default)', done => {
  const DEFAULT_TWIML = '<Response><Say>echo</Say></Response>';
  const callback = (err, result) => {
    expectTwiml(result, DEFAULT_TWIML);
    done();
  };
  funlet({}, {}, callback);
});
