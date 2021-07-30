const sinon = require('sinon');
const sendSms = require('../functions/send-sms').handler;
let Twilio = require('twilio');

describe('#send-sms', () => {
  it('provides correct message to Twilio client', () => {
    let createSpy = sinon.spy(() => {
      return new Promise((resolve, reject) => {
        resolve({ sid: '123abc' });
      });
    });

    let mockTwilioClient = () => {
      return {
        messages: {
          create: createSpy,
        },
      };
    };

    let context = {
      getTwilioClient: mockTwilioClient,

      CAMPAIGN_TITLE: 'test campaign',
      OPT_IN_KEYWORD: 'mykey',
      TWILIO_PHONE_NUMBER: '+2345678901',
    };

    let event = {
      body: 'blah',
      to: '+1234567890',
    };

    sendSms(context, event, () => {});
    let paramsObject = createSpy.getCall(0).args[0];

    expect(paramsObject.from).toEqual('+2345678901');
    expect(paramsObject.body).toEqual(
      'Thanks for your interest in test campaign, reply with mykey to opt-in.'
    );
  });
});
