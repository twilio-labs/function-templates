const funlet = require('../../functions/echo.protected');
const runtime = require('../../../test/test-helper');
const Twilio = require('twilio');

const TWIML = '<Response><Say>echo okay</Say></Response>';
const DEFAULT_TWIML = '<Response><Say>echo</Say></Response>';

beforeAll(() => runtime.setup());

test('[ECHO-INPUT-TWIML-1] Read Twiml from Event', () => {
  expect(funlet.input.getTwiml({ Twiml: TWIML }, {}, {})).toBe(TWIML);
});

test('[ECHO-INPUT-TWIML-2] Read Twiml from Context', () => {
  expect(funlet.input.getTwiml({}, { FUNLET_ECHO_TWIML: TWIML }, {})).toBe(
    TWIML
  );
});

test('[ECHO-INPUT-TWIML-3] Read Twiml from Script Config', () => {
  expect(funlet.input.getTwiml({}, {}, { twiml: TWIML })).toBe(TWIML);
});

test('[ECHO-INPUT-TWIML-4] Read Default Twiml from Script Config', () => {
  expect(funlet.config.twiml).toBe(DEFAULT_TWIML);
});

test('[ECHO-OUTPUT-ECHO-1] echo() shall return its input', () => {
  expect(funlet.output.echo(TWIML)).toBe(TWIML);
});

test('[ECHO-1] Full Response', (done) => {
  const callback = (err, result) => {
    expect(err).toBe(null);
    expect(result).toBeInstanceOf(Twilio.Response);
    expect(result._body).toBe(TWIML);
    expect(result._headers['Content-Type']).toBe('text/xml');
    done();
  };
  funlet.handler({}, { Twiml: TWIML }, callback);
});

afterAll(() => runtime.teardown());
