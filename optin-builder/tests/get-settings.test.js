const sinon = require('sinon');
const rewire = require('rewire');
const Twilio = require('twilio');

class Runtime {}

function getFunctions() {
  return {
    utils: {
      path: '../functions/utils.private.js',
    },
  };
}

const {
  Response,
} = require(`${__dirname}/../../node_modules/twilio-run/dist/runtime/internal/response`);

Twilio.Response = Response;

const getSettings = rewire('../functions/get-settings');
getSettings.__set__('Twilio', Twilio);
getSettings.__set__('Runtime', Runtime);
getSettings.__set__('Runtime.getFunctions', getFunctions);

const { handler } = getSettings;

describe('#get-settings', () => {
  let callback;
  beforeEach(() => {
    // eslint-disable-next-line no-empty-function
    callback = sinon.spy(() => {});
  });

  it('returns specified environment variables', () => {
    const context = {
      LOGO_URL: 'a',
      CAMPAIGN_TITLE: 'b',
      CAMPAIGN_DESCRIPTION: 'c',
      BUTTON_CTA: 'd',
      BACKGROUND_COLOR: 'e',
      FONT_COLOR: 'f',
      CUSTOM_CSS: 'g',
      MESSAGE_FREQUENCY: 'h',
      CONTACT_INFORMATION: 'i',
      OPT_IN_KEYWORD: 'j',
      PRIVACY_POLICY_LINK: 'k',
      DOMAIN_NAME: 'l',
      DATA_SOURCE: 'm',
      WEBHOOK_URL: 'n',
      AIRTABLE_TABLE_NAME: 'o',
      AIRTABLE_PHONE_COLUMN_NAME: 'p',
      AIRTABLE_OPT_IN_COLUMN_NAME: 'q',
    };

    handler(context, {}, callback);

    const respBody = callback.getCall(0).args[1].body;

    expect(respBody.logoUrl).toEqual('a');
    expect(respBody.campaignTitle).toEqual('b');
    expect(respBody.campaignDescription).toEqual('c');
    expect(respBody.buttonCta).toEqual('d');
    expect(respBody.backgroundColor).toEqual('e');
    expect(respBody.fontColor).toEqual('f');
    expect(respBody.customCss).toEqual('g');
    expect(respBody.messageFrequency).toEqual('h');
    expect(respBody.contactInformation).toEqual('i');
    expect(respBody.optInKeyword).toEqual('j');
    expect(respBody.privacyPolicyLink).toEqual('k');
    expect(respBody.domainName).toEqual('l');
    expect(respBody.dataSource).toEqual('m');
    expect(respBody.webhookUrl).toEqual('n');
    expect(respBody.airtableTableName).toEqual('o');
    expect(respBody.airtablePhoneColumnName).toEqual('p');
    expect(respBody.airtableOptInColumnName).toEqual('q');
  });

  it('redacts segment write key, airtable API key, and airtable base ID', () => {
    const context = {
      SEGMENT_WRITE_KEY: '12345',
      AIRTABLE_BASE_ID: 'abcd',
      AIRTABLE_API_KEY: '!@#',
    };

    handler(context, {}, callback);

    const respBody = callback.getCall(0).args[1].body;

    expect(respBody.segmentWriteKey).toEqual('•••••');
    expect(respBody.airtableBaseId).toEqual('••••');
    expect(respBody.airtableApiKey).toEqual('•••');
  });

  it('returns 200 when env vars are not set', () => {
    handler({}, {}, callback);
    const response = callback.getCall(0).args[1];

    expect(response.statusCode).toEqual(200);
  });

  it('returns empty string for each optional setting rather than undefined', () => {
    handler({}, {}, callback);
    const respBody = callback.getCall(0).args[1].body;

    expect(respBody.logoUrl).toEqual('');
    expect(respBody.buttonCta).toEqual('');
    expect(respBody.backgroundColor).toEqual('');
    expect(respBody.fontColor).toEqual('');
    expect(respBody.customCss).toEqual('');
    expect(respBody.domainName).toEqual('');
    expect(respBody.dataSource).toEqual('');
    expect(respBody.webhookUrl).toEqual('');
    expect(respBody.segmentWriteKey).toEqual('');
    expect(respBody.airtableApiKey).toEqual('');
    expect(respBody.airtableBaseId).toEqual('');
    expect(respBody.airtableTableName).toEqual('');
    expect(respBody.airtablePhoneColumnName).toEqual('');
    expect(respBody.airtableOptInColumnName).toEqual('');
  });

  describe('#set-compliance-warning', () => {
    it('returns predefined text for compliance related fields and sets warning label', () => {
      handler({}, {}, callback);
      const respBody = callback.getCall(0).args[1].body;

      expect(respBody.complianceWarning).toEqual([
        'campaignTitle',
        'campaignDescription',
        'messageFrequency',
        'contactInformation',
        'privacyPolicyLink',
      ]);
      expect(respBody.campaignTitle).toEqual('Campaign Title Placeholder');
      expect(respBody.campaignDescription).toEqual(
        'This is a placeholder for a brief description of your campaign.'
      );
      expect(respBody.messageFrequency).toEqual(
        'Message frequency placeholder'
      );
      expect(respBody.contactInformation).toEqual(
        'Contact information placeholder'
      );
      expect(respBody.privacyPolicyLink).toEqual(
        'Placeholder privacy policy link'
      );
    });

    it('does not return a complianceWarning key if all compliance fields are set', () => {
      const context = {
        CAMPAIGN_TITLE: 'whocares',
        CAMPAIGN_DESCRIPTION: 'whocares',
        MESSAGE_FREQUENCY: 'whocares',
        CONTACT_INFORMATION: 'whocares',
        PRIVACY_POLICY_LINK: 'whocares',
      };

      handler(context, {}, callback);
      const respBody = callback.getCall(0).args[1].body;

      expect(respBody.complianceWarning).toEqual(undefined);
    });
  });
});
