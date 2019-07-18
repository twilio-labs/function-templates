const funlet = require('./funlet-echo').handler;
const TWIML = '<Response><Say>echo okay</Say></Response>';

test('[Echo-1.1] Echo (GET)', done => {
  const callback = (err, result) => {
    expect(result).toBe( TWIML );
    done();
  };
  funlet({}, {Twiml:TWIML}, callback);
});

test('[Echo-1.2] Echo (ENV)', done => {
  const callback = (err, result) => {
    expect(result).toBe( TWIML );
    done();
  };
  funlet({ECHO_TWIML:TWIML}, {}, callback);
});

test('[Echo-1.3] Echo (Default)', done => {
  const DEFAULT_TWIML = '<Response><Say>echo</Say></Response>';
  const callback = (err, result) => {
    expect(result).toBe( DEFAULT_TWIML );
    done();
  };
  funlet({}, {}, callback);
});
