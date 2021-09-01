/* eslint-disable no-empty-function */
const sinon = require('sinon');
const rewire = require('rewire');
const Twilio = require('twilio');

const createMockRequire = require('./mocks/mock-require');
const { webhook } = require('twilio/lib/webhooks/webhooks');

receiveSms = rewire('../functions/receive-sms.protected');

class Runtime {}

function getFunctions() {
  return {
    utils: {
      path: './utils.private.js',
    },
  };
}

receiveSms.__set__('Runtime', Runtime);
receiveSms.__set__('Runtime.getFunctions', getFunctions);
receiveSms.__set__('Twilio', Twilio);

describe('#receive-sms', () => {
  let segmentSpy = null;
  let webhookSpy = null;
  let airtableOptInSpy = null;
  let airtableRemoveOptInSpy = null;

  beforeEach(() => {
    segmentSpy = sinon.spy();
    webhookSpy = sinon.spy();
    airtableOptInSpy = sinon.spy();
    airtableRemoveOptInSpy = sinon.spy();
  });

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

      mockRequire = createMockRequire(
        segmentSpy,
        webhookSpy,
        airtableOptInSpy,
        airtableRemoveOptInSpy
      );
      receiveSms.__set__('require', mockRequire);
      receiveSms.handler(context, event, () => {});

      expect(airtableOptInSpy.called).toEqual(true);
      expect(airtableRemoveOptInSpy.called).toEqual(false);
      expect(webhookSpy.called).toEqual(false);
      expect(segmentSpy.called).toEqual(false);
    });

    it('calls segmentOptIn with "true" if keyword is an opt-in and data source is segment', () => {
      const context = {
        OPT_IN_KEYWORD: 'join',
        SUBSCRIBE_CONFIRMATION: 'Thanks for opting in.',
        DATA_SOURCE: 'segment',
        AIRTABLE_API_KEY: '123',
        AIRTABLE_BASE_ID: 'abc',
        SEGMENT_WRITE_KEY: 'xyz',
      };

      const event = {
        Body: 'Join',
      };

      mockRequire = createMockRequire(
        segmentSpy,
        webhookSpy,
        airtableOptInSpy,
        airtableRemoveOptInSpy
      );
      receiveSms.__set__('require', mockRequire);
      receiveSms.handler(context, event, () => {});

      expect(segmentSpy.called).toEqual(true);
      expect(segmentSpy.getCall(0).args[1]).toEqual(true);

      expect(airtableOptInSpy.called).toEqual(false);
      expect(airtableRemoveOptInSpy.called).toEqual(false);
      expect(webhookSpy.called).toEqual(false);
    });

    it('calls webhookOptIn with "true" if keyword is an opt-in and data source is segment', () => {
      const context = {
        OPT_IN_KEYWORD: 'join',
        SUBSCRIBE_CONFIRMATION: 'Thanks for opting in.',
        DATA_SOURCE: 'webhook',
        AIRTABLE_API_KEY: '123',
        AIRTABLE_BASE_ID: 'abc',
        SEGMENT_WRITE_KEY: 'xyz',
      };

      const event = {
        Body: 'Join',
      };

      mockRequire = createMockRequire(
        segmentSpy,
        webhookSpy,
        airtableOptInSpy,
        airtableRemoveOptInSpy
      );
      receiveSms.__set__('require', mockRequire);
      receiveSms.handler(context, event, () => {});

      expect(webhookSpy.called).toEqual(true);
      expect(webhookSpy.getCall(0).args[1]).toEqual(true);

      expect(segmentSpy.called).toEqual(false);
      expect(airtableOptInSpy.called).toEqual(false);
      expect(airtableRemoveOptInSpy.called).toEqual(false);
    });
  });

  describe('opt-out', () => {
    it('calls airtableRemoveOptIn when keyword is opt-out and data source is airtable', () => {
      const context = {
        OPT_IN_KEYWORD: 'Join',
        SUBSCRIBE_CONFIRMATION: 'Thanks for opting in.',
        DATA_SOURCE: 'airtable',
        AIRTABLE_API_KEY: '123',
        AIRTABLE_BASE_ID: 'abc',
        SEGMENT_WRITE_KEY: 'xyz',
      };

      const event = {
        Body: 'STOP',
      };

      mockRequire = createMockRequire(
        segmentSpy,
        webhookSpy,
        airtableOptInSpy,
        airtableRemoveOptInSpy
      );
      receiveSms.__set__('require', mockRequire);
      receiveSms.handler(context, event, () => {});

      expect(airtableOptInSpy.called).toEqual(false);
      expect(airtableRemoveOptInSpy.called).toEqual(true);
      expect(webhookSpy.called).toEqual(false);
      expect(segmentSpy.called).toEqual(false);
    });

    it('calls segmentOptIn with "false" when keyword is opt-out and data source is segment', () => {
      const context = {
        OPT_IN_KEYWORD: 'Join',
        SUBSCRIBE_CONFIRMATION: 'Thanks for opting in.',
        DATA_SOURCE: 'segment',
        AIRTABLE_API_KEY: '123',
        AIRTABLE_BASE_ID: 'abc',
        SEGMENT_WRITE_KEY: 'xyz',
      };

      const event = {
        Body: 'Quit',
      };

      mockRequire = createMockRequire(
        segmentSpy,
        webhookSpy,
        airtableOptInSpy,
        airtableRemoveOptInSpy
      );
      receiveSms.__set__('require', mockRequire);
      receiveSms.handler(context, event, () => {});

      expect(segmentSpy.called).toEqual(true);
      expect(segmentSpy.getCall(0).args[1]).toEqual(false);

      expect(airtableOptInSpy.called).toEqual(false);
      expect(airtableRemoveOptInSpy.called).toEqual(false);
      expect(webhookSpy.called).toEqual(false);
    });

    it('calls webhookOptIn with "false" when keyword is opt-out and data source is false', () => {
      const context = {
        OPT_IN_KEYWORD: 'Join',
        SUBSCRIBE_CONFIRMATION: 'Thanks for opting in.',
        DATA_SOURCE: 'webhook',
        AIRTABLE_API_KEY: '123',
        AIRTABLE_BASE_ID: 'abc',
        SEGMENT_WRITE_KEY: 'xyz',
      };

      const event = {
        Body: 'stop',
      };

      mockRequire = createMockRequire(
        segmentSpy,
        webhookSpy,
        airtableOptInSpy,
        airtableRemoveOptInSpy
      );
      receiveSms.__set__('require', mockRequire);
      receiveSms.handler(context, event, () => {});

      expect(webhookSpy.called).toEqual(true);
      expect(webhookSpy.getCall(0).args[1]).toEqual(false);

      expect(segmentSpy.called).toEqual(false);
      expect(airtableOptInSpy.called).toEqual(false);
      expect(airtableRemoveOptInSpy.called).toEqual(false);
    });
  });
});
