exports.handler = function(context, event, callback) {
    let response = new Twilio.Response();
    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "GET");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
    response.appendHeader('Content-Type', 'application/json');

    // This function only returns public settings, private variables are redacted.
    function redactVariable(envVar) {
        let redacted = envVar.split('').map((char) => { return '•' }).join('');
        return redacted;
    }

    let body = {
        logoUrl: context.LOGO_URL,
        campaignTitle: context.CAMPAIGN_TITLE,
        campaignDescription: context.CAMPAIGN_DESCRIPTION,
        buttonCta: context.BUTTON_CTA,

        backgroundColor: context.BACKGROUND_COLOR,
        fontColor: context.FONT_COLOR,
        customCss: context.CUSTOM_CSS,

        messageQuantity: context.MESSAGE_QUANTITY,
        messageInterval: context.MESSAGE_INTERVAL,
        contactInformation: context.CONTACT_INFORMATION,
        optInKeyword: context.OPT_IN_KEYWORD,
        privacyPolicyLink: context.PRIVACY_POLICY_LINK,
        tosLink: context.TOS_LINK,
        domainName: context.DOMAIN_NAME,
        dataSource: context.DATA_SOURCE,

        webhookUrl: context.WEBHOOK_URL,

        segmentWriteKey: redactVariable(context.SEGMENT_WRITE_KEY),

        airtableApiKey: redactVariable(context.AIRTABLE_API_KEY),
        airtableBaseId: redactVariable(context.AIRTABLE_BASE_ID),
        airtableTableName: context.AIRTABLE_TABLE_NAME,
        airtablePhoneColumnName: context.AIRTABLE_PHONE_COLUMN_NAME,
        airtableOptInColumnName: context.AIRTABLE_OPT_IN_COLUMN_NAME,
    }

    response.setStatusCode(200);
    response.setBody(body);

    console.log(response);
    callback(null, response);
}