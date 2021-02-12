/* eslint-disable no-console */
const crypto = require('crypto');

// eslint-disable-next-line func-names
exports.handler = function (context, event, callback) {
  // Validate token before running
  function isAllowed(token) {
    // Create the token with the environment password
    const tokenString = `${context.ACCOUNT_SID}:${context.ADMIN_PASSWORD}:${context.SALT}`;

    // Similar to TwilioClient
    const originalToken = crypto
      .createHmac('sha1', context.AUTH_TOKEN)
      .update(Buffer.from(tokenString, 'utf-8'))
      .digest('base64');

    return originalToken === token;
  }

  if (!isAllowed(event.token)) {
    // eslint-disable-next-line no-undef
    const response = new Twilio.Response();
    response.status(403);
    response.message('unathorized');

    callback('unauthorized', response);
    return;
  }

  const client = context.getTwilioClient();

  client.studio.v1.flows(event.sid).executions.list({ limit: 100 })
    .then((executions) => {
      if (executions.length > 0) {
        const endedExecutions = executions.filter((e) => e.status === 'ended');
        const promises = endedExecutions.map((e) => new Promise((resolve, reject) => {
          client.studio.flows(event.sid)
            .executions(e.sid)
            .executionContext()
            .fetch()
            .then((executionContext) => {
              try {
                const resident = {};
                const ec = executionContext.context;
                resident.age = ec.widgets.Age.inbound.Body;
                resident.name = ec.widgets.Name.inbound.Body;
                resident.phone_number = ec.trigger.message.From;
                resident.zip_code = ec.widgets.ZipCode.inbound.Body;
                resident.essential_worker = ec.widgets.EssentialWorker.inbound.Body;
                resident.work_from_home = ec.widgets.WorkFromHome.inbound.Body;
                resident.long_term_care = ec.widgets.LongTermCare.inbound.Body;
                resident.congregate_setting = ec.widgets.CongregateSetting.inbound.Body;
                resident.health_condition = ec.widgets.HealthCondition.inbound.Body;
                resident.notification_preference = ec.widgets.NotificationPreference.inbound.Body;
                resident.language_preference = ec.widgets.LanguagePreference.inbound.Body;
                resolve(resident);
              } catch (err) {
                reject(err);
              }
            })
            .catch((err) => {
              console.log(err);
              reject(err);
            });
        }));

        Promise.all(promises).then((data) => {
          callback(null, data);
        })
          .catch((err) => callback(err));
      }
    })
    .catch((err) => callback(err));
};
