const sinon = require('sinon');
const rewire = require('rewire');
let Twilio = require('twilio');
const { Response } = require('../node_modules/twilio-run/dist/runtime/internal/response');
const twilio = require('twilio');
Twilio.Response = Response;

let getSettings = rewire('../functions/get-settings');
getSettings.__set__("Twilio", Twilio);

const { handler } = getSettings;

describe("#get-settings", () => {
    let callback;
    beforeEach(() => {
        callback = sinon.spy(() => {})
    })

    it("returns specified environment variables", () => {

        let context = {
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
        }

        handler(context, {}, callback);

        let respBody = callback.getCall(0).args[1].body;

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

    it("redacts segment write key, airtable API key, and airtable base ID", () => {
        const context = {
            SEGMENT_WRITE_KEY: '12345',
            AIRTABLE_BASE_ID: 'abcd',
            AIRTABLE_API_KEY: '!@#'
        }

        handler(context, {}, callback);

        let respBody = callback.getCall(0).args[1].body;

        expect(respBody.segmentWriteKey).toEqual('•••••');
        expect(respBody.airtableBaseId).toEqual('••••');
        expect(respBody.airtableApiKey).toEqual('•••');
    });

    it("returns 200 when env vars are not set", () => {
        handler({}, {}, callback);
        let response = callback.getCall(0).args[1];

        expect(response.statusCode).toEqual(200);
    });

    it("returns empty string for each setting rather than undefined", () => {
        handler({}, {}, callback);
        let respBody = callback.getCall(0).args[1].body;

        for (item in respBody) {
            expect(respBody[item]).toEqual("");
        }
    });
});