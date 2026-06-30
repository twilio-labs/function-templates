/* eslint-disable prefer-const */
// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
exports.handler = function (context, event, callback) {
  // eslint-disable-next-line dot-notation
  const { path } = Runtime.getFunctions().utils;
  const { redactVariable } = require(path);

  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  let body;
  const missingComplianceFields = [];

  function setComplianceWarning(field, defaultSetting) {
    missingComplianceFields.push(field);

    return defaultSetting;
  }

  body = {
    logoUrl: context.LOGO_URL || '',

    // Required for compliance
    campaignTitle:
      context.CAMPAIGN_TITLE ||
      setComplianceWarning('campaignTitle', 'Campaign Title Placeholder'),

    // Required for compliance
    campaignDescription:
      context.CAMPAIGN_DESCRIPTION ||
      setComplianceWarning(
        'campaignDescription',
        'This is a placeholder for a brief description of your campaign.'
      ),

    buttonCta: context.BUTTON_CTA || '',
    backgroundColor: context.BACKGROUND_COLOR || '',
    fontColor: context.FONT_COLOR || '',
    customCss: context.CUSTOM_CSS || '',

    // Required for compliance
    messageFrequency:
      context.MESSAGE_FREQUENCY ||
      setComplianceWarning('messageFrequency', 'Message frequency placeholder'),

    // Required for compliance
    contactInformation:
      context.CONTACT_INFORMATION ||
      setComplianceWarning(
        'contactInformation',
        'Contact information placeholder'
      ),

    optInKeyword: context.OPT_IN_KEYWORD || 'join',

    // Required for compliance
    privacyPolicyLink:
      context.PRIVACY_POLICY_LINK ||
      setComplianceWarning(
        'privacyPolicyLink',
        'Placeholder privacy policy link'
      ),

    domainName: context.DOMAIN_NAME || '',
    dataSource: context.DATA_SOURCE || '',
    webhookUrl: context.WEBHOOK_URL || '',
    segmentWriteKey: redactVariable(context.SEGMENT_WRITE_KEY) || '',
    airtableApiKey: redactVariable(context.AIRTABLE_API_KEY) || '',
    airtableBaseId: redactVariable(context.AIRTABLE_BASE_ID) || '',
    airtableTableName: context.AIRTABLE_TABLE_NAME || '',
    airtablePhoneColumnName: context.AIRTABLE_PHONE_COLUMN_NAME || '',
    airtableOptInColumnName: context.AIRTABLE_OPT_IN_COLUMN_NAME || '',
  };

  if (missingComplianceFields.length > 0) {
    body.complianceWarning = missingComplianceFields;
  }

  response.setStatusCode(200);
  response.setBody(body);

  // console.log(response);
  callback(null, response);
};
