const funlet = require('./funlet-simple-message');
const Twilio = require('twilio');

const MESSAGE1="Message #1";
const MESSAGE2="Message #2";
const MESSAGE3="Message #3";
const MESSAGE4="Message #4";
const MESSAGE5="Message #5";

const DEFAULT_MESSAGE="";

test('[SIMPLE-MESSAGE-INPUT-MESSAGE-1] Read Single Message from Event',
() => {
  expect(
    funlet.input.getMessage({}, {Message:MESSAGE1})
  ).toEqual( [MESSAGE1] );
});

test('[SIMPLE-MESSAGE-INPUT-MESSAGE-2] Read List of Messages from Event',
() => {
  expect(
    funlet.input.getMessage({}, {Message:[MESSAGE1,MESSAGE2,MESSAGE3]})
  ).toEqual( [MESSAGE1,MESSAGE2,MESSAGE3] );
});

test('[SIMPLE-MESSAGE-INPUT-MESSAGE-3] Read Single Message from Environment',
() => {
  expect(
    funlet.input.getMessage({FUNLET_MESSAGE1:MESSAGE1}, {})
  ).toEqual( [MESSAGE1] );
});

test('[SIMPLE-MESSAGE-INPUT-MESSAGE-4] Read Five Messages from Environment',
() => {
  expect(
    funlet.input.getMessage(
      {
        FUNLET_MESSAGE1:MESSAGE1,
        FUNLET_MESSAGE2:MESSAGE2,
        FUNLET_MESSAGE3:MESSAGE3,
        FUNLET_MESSAGE4:MESSAGE4,
        FUNLET_MESSAGE5:MESSAGE5
      }, {}
    )
  ).toEqual( [MESSAGE1,MESSAGE2,MESSAGE3,MESSAGE4,MESSAGE5] );
});

test('[SIMPLE-MESSAGE-INPUT-MESSAGE-5] Read Default Message from Script',
() => {
  expect(
    funlet.input.getMessage({}, {})
  ).toEqual( [DEFAULT_MESSAGE] );
});

test.skip('Missing Tests', done => {
  const callback = (err, result) => {
    expect(result).toBe('...');
    done();
  };
  funlet({}, {}, callback);
});
