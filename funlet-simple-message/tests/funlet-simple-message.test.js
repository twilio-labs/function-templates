const funlet = require('../functions/funlet-simple-message');
const runtime = require('../../test/test-helper');
const Twilio = require('twilio');

const MESSAGE1="Message #1";
const MESSAGE2="https://example.com/message2";
const MESSAGE3="Message #3";
const MESSAGE4="https://example.com/message4";
const MESSAGE5="Message #5";

const DEFAULT_MESSAGE="";

const XML_DECLARATION='<?xml version="1.0" encoding="UTF-8"?>';

const ENGLISH="en";
const FRENCH="fr";
const DEFAULT_LANGUAGE=ENGLISH;

const MAN="man";
const WOMAN="woman";
const ALICE="alice";
const DEFAULT_VOICE=ALICE;

const RECORDED_MESSAGE="https://example.com/recorded-message";
const PLAY_RECORDED_MESSAGE =
  XML_DECLARATION+
  '<Response>'+
    '<Play>'+RECORDED_MESSAGE+'</Play>'+
  '</Response>';

const TEXT_MESSAGE="Text message";
const SAY_TEXT_MESSAGE =
  XML_DECLARATION+
  '<Response>'+
    '<Say language="'+ENGLISH+'" voice="'+ALICE+'">'+TEXT_MESSAGE+'</Say>'+
  '</Response>';

const NO_MESSAGES=[];
const EMPTY_RESPONSE=
  XML_DECLARATION+
  '<Response/>';

const SINGLE_RECORDED_MESSAGE=[RECORDED_MESSAGE];
const SINGLE_TEXT_MESSAGE=[TEXT_MESSAGE];

const MULTIPLE_MESSAGES=[MESSAGE1,MESSAGE2,MESSAGE3];
const PLAY_AND_SAY_MESSAGES =
  XML_DECLARATION+
  '<Response>'+
    '<Say language="'+ENGLISH+'" voice="'+ALICE+'">'+MESSAGE1+'</Say>'+
    '<Play>'+MESSAGE2+'</Play>'+
    '<Say language="'+ENGLISH+'" voice="'+ALICE+'">'+MESSAGE3+'</Say>'+
  '</Response>';

beforeAll( () =>
  runtime.setup()
);

test('[SIMPLE-MESSAGE-INPUT-READ-LIST-PARAM-0] Read Empty List',
() => {
  let empty = [];
  expect(
    funlet.input.readListParam("Param", {})
  ).toEqual( empty );
});

test('[SIMPLE-MESSAGE-INPUT-READ-LIST-PARAM-1] Read Single String',
() => {
  let string = "one";
  expect(
    funlet.input.readListParam("Param", {Param:string})
  ).toEqual( [string] );
});

test('[SIMPLE-MESSAGE-INPUT-READ-LIST-PARAM-2] Read Array',
() => {
  let array = ["one", "two", "three"];
  expect(
    funlet.input.readListParam("Param", {Param:array})
  ).toEqual( array );
});

test('[SIMPLE-MESSAGE-INPUT-READ-LIST-PARAM-3] Read Sequential Indexed Values',
() => {
  let array = ["zero", "one", "two"];
  expect(
    funlet.input.readListParam("Param", {
      "Param[0]": array[0],
      "Param[1]": array[1],
      "Param[2]": array[2]
    })
  ).toEqual( array );
});

test('[SIMPLE-MESSAGE-INPUT-READ-LIST-PARAM-4] '+
     'Read Non-Sequential Indexed Values',
() => {
  let array = [];
  array[1] = "the one";
  array[42] = "the answer";
  array[99] = "bottles of beer";
  expect(
    funlet.input.readListParam("Param", {
      "Param[1]": array[1],
      "Param[42]": array[42],
      "Param[99]": array[99]
    })
  ).toEqual( array );
});

test('[SIMPLE-MESSAGE-INPUT-READ-LIST-PARAM-5] '+
     'Mix of String and Non-Sequential Indexed Values',
() => {
  let array = [];
  array[1] = "the one";
  array[42] = "the answer";
  array[99] = "bottles of beer";
  array[100] = "the end";
  expect(
    funlet.input.readListParam("Param", {
      "Param": array[100],
      "Param[1]": array[1],
      "Param[42]": array[42],
      "Param[99]": array[99]
    })
  ).toEqual( array );
});

test('[SIMPLE-MESSAGE-INPUT-READ-LIST-PARAM-5] '+
     'Mix of Array and Non-Sequential Indexed Values',
() => {
  let array = [];
  array[1] = "the one";
  array[42] = "the answer";
  array[99] = "bottles of beer";
  array[100] = "the end";
  array[101] = "the basics";
  array[102] = "a new hope";
  expect(
    funlet.input.readListParam("Param", {
      "Param": [ array[100], array[101], array[102] ],
      "Param[1]": array[1],
      "Param[42]": array[42],
      "Param[99]": array[99]
    })
  ).toEqual( array );
});

test('[SIMPLE-MESSAGE-INPUT-MESSAGES-1] Read Single Message from Event',
() => {
  expect(
    funlet.input.getMessages({Message:MESSAGE1}, {}, {})
  ).toEqual( [MESSAGE1] );
});

test('[SIMPLE-MESSAGE-INPUT-MESSAGES-2] Read List of Messages from Event',
() => {
  expect(
    funlet.input.getMessages({Message:[MESSAGE1,MESSAGE2,MESSAGE3]}, {}, {})
  ).toEqual( [MESSAGE1,MESSAGE2,MESSAGE3] );
});

test('[SIMPLE-MESSAGE-INPUT-MESSAGES-3] '+
     'Read Indexed List of Messages from Event',
() => {
  expect(
    funlet.input.getMessages({
      "Message[0]": MESSAGE1,
      "Message[1]": MESSAGE2,
      "Message[2]": MESSAGE3
    }, {}, {})
  ).toEqual( [MESSAGE1,MESSAGE2,MESSAGE3] );
});

test('[SIMPLE-MESSAGE-INPUT-MESSAGES-4] Read Single Message from Environment',
() => {
  expect(
    funlet.input.getMessages({}, {FUNLET_MESSAGE1:MESSAGE1}, {})
  ).toEqual( [MESSAGE1] );
});

test('[SIMPLE-MESSAGE-INPUT-MESSAGES-5] Read Five Messages from Environment',
() => {
  expect(
    funlet.input.getMessages({},
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

test('[SIMPLE-MESSAGE-INPUT-MESSAGE-6] Read Default Message from Script',
() => {
  expect(
    funlet.input.getMessages({}, {}, {messages: [MESSAGE1,MESSAGE2,MESSAGE3]})
  ).toEqual( [MESSAGE1,MESSAGE2,MESSAGE3] );
});

test('[SIMPLE-MESSAGE-INPUT-MESSAGE-7] '+
     'Read Default Message from Script Config',
() => {
  expect( funlet.config.messages ).toEqual( [DEFAULT_MESSAGE] );
});

test('[SIMPLE-MESSAGE-INPUT-LANGUAGE-1] Read Language from Event',
() => {
  expect(
    funlet.input.getLanguage({Language:FRENCH}, {}, {})
  ).toEqual( FRENCH );
});

test('[SIMPLE-MESSAGE-INPUT-LANGUAGE-2] Read Language from Environment',
() => {
  expect(
    funlet.input.getLanguage({}, {FUNLET_MESSAGE_LANGUAGE:FRENCH}, {})
  ).toEqual( FRENCH );
});

test('[SIMPLE-MESSAGE-INPUT-LANGUAGE-3] Read Language from Script Config',
() => {
  expect(
    funlet.input.getLanguage({}, {}, {language: FRENCH})
  ).toEqual( FRENCH );
});

test('[SIMPLE-MESSAGE-INPUT-LANGUAGE-4] '+
     'Read Default Language from Script Config',
() => {
  expect( funlet.config.language ).toEqual( DEFAULT_LANGUAGE );
});

test('[SIMPLE-MESSAGE-INPUT-VOICE-1] Read Voice from Event',
() => {
  expect(
    funlet.input.getVoice({Voice:MAN}, {}, {})
  ).toEqual( MAN );
});

test('[SIMPLE-MESSAGE-INPUT-VOICE-2] Read Voice from Environment',
() => {
  expect(
    funlet.input.getVoice({}, {FUNLET_MESSAGE_VOICE:WOMAN}, {})
  ).toEqual( WOMAN );
});

test('[SIMPLE-MESSAGE-INPUT-VOICE-3] Read Default Voice from Script',
() => {
  expect(
    funlet.input.getVoice({}, {}, {voice: WOMAN})
  ).toEqual( WOMAN );
});

test('[SIMPLE-MESSAGE-INPUT-VOICE-4] Read Default Voice from Script Config',
() => {
  expect( funlet.config.voice ).toEqual( DEFAULT_VOICE );
});

test('[SIMPLE-MESSAGE-OUTPUT-SIMPLE-MESSAGE-0] '+
     'simpleMessage() with Empty Message',
() => {
  const EMPTY_MESSAGE="";
  const EMPTY_RESPONSE=
    XML_DECLARATION+
    '<Response/>';

  let response = new Twilio.twiml.VoiceResponse();
  funlet.output.simpleMessage( response, EMPTY_MESSAGE, ENGLISH, ALICE );
  expect( response.toString() ).toEqual( EMPTY_RESPONSE );
});

test('[SIMPLE-MESSAGE-OUTPUT-SIMPLE-MESSAGE-1] '+
     'simpleMessage() with Recorded Message',
() => {
  let response = new Twilio.twiml.VoiceResponse();
  funlet.output.simpleMessage(response, RECORDED_MESSAGE, ENGLISH, ALICE);
  expect( response.toString() ).toEqual( PLAY_RECORDED_MESSAGE );
});

test('[SIMPLE-MESSAGE-OUTPUT-SIMPLE-MESSAGE-2] '+
     'simpleMessage() with Text Message',
() => {
  let response = new Twilio.twiml.VoiceResponse();
  funlet.output.simpleMessage(response, TEXT_MESSAGE, ENGLISH, ALICE);
  expect( response.toString() ).toEqual( SAY_TEXT_MESSAGE );
});

test('[SIMPLE-MESSAGE-OUTPUT-SIMPLE-MESSAGES-0] '+
     'simpleMessages() with Empty List',
() => {
  let response = new Twilio.twiml.VoiceResponse();
  funlet.output.simpleMessages( response, NO_MESSAGES, ENGLISH, ALICE );
  expect( response.toString() ).toEqual( EMPTY_RESPONSE );
});

test('[SIMPLE-MESSAGE-OUTPUT-SIMPLE-MESSAGES-1] '+
     'simpleMessages() with Single Recorded Message',
() => {
  let response = new Twilio.twiml.VoiceResponse();
  funlet.output.simpleMessages(response, SINGLE_RECORDED_MESSAGE, ENGLISH, ALICE);
  expect( response.toString() ).toEqual( PLAY_RECORDED_MESSAGE );
});

test('[SIMPLE-MESSAGE-OUTPUT-SIMPLE-MESSAGES-2] '+
     'simpleMessages() with Single Text Message',
() => {
  let response = new Twilio.twiml.VoiceResponse();
  funlet.output.simpleMessages(response, SINGLE_TEXT_MESSAGE, ENGLISH, ALICE);
  expect( response.toString() ).toEqual( SAY_TEXT_MESSAGE );
});

test('[SIMPLE-MESSAGE-OUTPUT-SIMPLE-MESSAGES-3] '+
     'simpleMessages() with Multiple Messages',
() => {
  let response = new Twilio.twiml.VoiceResponse();
  funlet.output.simpleMessages(response, MULTIPLE_MESSAGES, ENGLISH, ALICE);
  expect( response.toString() ).toEqual( PLAY_AND_SAY_MESSAGES );
});

test('[SIMPLE-MESSAGE-3] Full Response: Multiple Messages', done => {
  const callback = (err, result) => {
    expect( result ).toBeInstanceOf( Twilio.twiml.VoiceResponse );
    expect( result.toString() ).toEqual( PLAY_AND_SAY_MESSAGES );
    done();
  };
  funlet.handler({}, {Message:MULTIPLE_MESSAGES}, callback);
});

afterAll( () =>
  runtime.teardown()
);
