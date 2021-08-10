/* eslint-disable no-empty-function */
const sinon = require('sinon');
const rewire = require('rewire');
const Twilio = require('twilio');

// const mockUtils = require('./mock-utils');

receiveSms = rewire('../functions/receive-sms.protected');

class Runtime {}

function getFunctions() {
  return {
    utils: {
      path: './utils.private.js',
    },
  };
}

function Airtable() {
  this.base = () => {};
}

function Analytics() {
  console.log('Mock Analytics');
}

receiveSms.__set__('Runtime', Runtime);
receiveSms.__set__('Runtime.getFunctions', getFunctions);
receiveSms.__set__('Twilio', Twilio);
receiveSms.__set__('Airtable', Airtable);

describe('#receive-sms', () => {
  describe('opt-in', () => {
    it('calls airtableCreateOptIn if keyword is an opt-in and data source is airtable', () => {
      const context = {
        OPT_IN_KEYWORD: 'join',
        SUBSCRIBE_CONFIRMATION: 'Thanks for opting in.',
        DATA_SOURCE: 'airtable',
        AIRTABLE_API_KEY: '123',
        AIRTABLE_BASE_ID: 'abc',
        SEGMENT_WRITE_KEY: 'xyz',
      };

      const event = {
        Body: 'Join',
      };

      const segmentSpy = sinon.spy();
      const webhookSpy = sinon.spy();
      const airtableOptInSpy = sinon.spy();
      const airtableRemoveOptInSpy = sinon.spy();

      // eslint-disable-next-line consistent-return
      function mockRequire(suppliedPath) {
        if (suppliedPath === './utils.private.js') {
          return {
            segmentOptIn: segmentSpy,
            webhookOptIn: webhookSpy,
            airtableCreateOptIn: airtableOptInSpy,
            airtableRemoveOptIn: airtableRemoveOptInSpy,
          };
        } else if (suppliedPath === 'airtable') {
          return Airtable;
        } else if (suppliedPath === 'analytics-node') {
          return Analytics;
        }
      }

      receiveSms.__set__('require', mockRequire);
      receiveSms.handler(context, event, () => {});

      expect(airtableOptInSpy.called).toEqual(true);
      expect(airtableRemoveOptInSpy.called).toEqual(false);
    });
  });

  describe('opt-out', () => {
    it('calls airtableRemoveOptIn', () => {
      context = {};
    });
  });
});
