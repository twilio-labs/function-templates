const funlet = require('./funlet-echo');
const Twilio = require('twilio');
const TWIML = '<Response><Say>echo okay</Say></Response>';

test('[ECHO-1.1] Echo (GET)', () => {
  expect(
    funlet.echo({}, {Twiml:TWIML})
  ).toBe( TWIML );
});

test('[ECHO-1.2] Echo (ENV)', () => {
  expect(
    funlet.echo({ECHO_TWIML:TWIML}, {})
  ).toBe( TWIML );
});

test('[ECHO-1.3] Echo (Default)', () => {
  const DEFAULT_TWIML = '<Response><Say>echo</Say></Response>';
  expect(
    funlet.echo({}, {})
  ).toBe( DEFAULT_TWIML );
});

test.skip('[ECHO-1] Response', done => {
  const callback = (err, result) => {
    expect( result ).toBeInstanceOf( Twilio.Response );
    expect( result.statusCode ).toBe( 200 );
    expect( result.body ).toBe( TWIML );
    expect( result.headers['Content-Type'] ).toBe( 'text/xml' );
    done();
  };
  funlet.handler({}, {Twiml:TWIML}, callback);
});
