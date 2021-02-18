/* eslint-disable no-console, func-names */
exports.handler = async function (context, event, callback) {

  const assets = Runtime.getAssets();
  const flowDefinition = require(assets["/studio_flow.js"].path);

  const client = context.getTwilioClient();

  // Deploy Twilio Studio Flow
  function deployStudio() {
    return client.studio.flows
        .create({
          commitMessage: 'Code Exchange automatic deploy',
          friendlyName: 'Vaccine Standby Intake',
          status: 'published',
          definition: flowDefinition,
        })
        .then((flow) => flow.webhookUrl)
        .catch((err) => { throw new Error(err.details) });
  }

  function getPhoneNumberSid() {
    return new Promise((resolve, reject) => {
      client.incomingPhoneNumbers
        .list({ phoneNumber: context.TWILIO_PHONE_NUMBER, limit: 20 })
        .then((incomingPhoneNumbers) => {
          const n = incomingPhoneNumbers[0];
          resolve(n.sid);
        })
        .catch((err) => reject(err));
    });
  }

  function updatePhoneNumberWebhook(studioWebhook, numberSid) {
    return new Promise((resolve, reject) => {
      client.incomingPhoneNumbers(numberSid)
        .update({
          smsUrl: studioWebhook,
        })
        .then(() => {
          resolve('success');
        })
        .catch((err) => reject(err));
    });
  }

  const webhookUrl = await deployStudio(flowDefinition);
  const phoneNumberSid = await getPhoneNumberSid();
  await updatePhoneNumberWebhook(webhookUrl, phoneNumberSid);

  callback(null, 'success');
};
