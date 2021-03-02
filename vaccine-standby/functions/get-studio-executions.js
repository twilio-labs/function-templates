// eslint-disable-next-line func-names
exports.handler = async function (context, event, callback) {
  // Validate token before running
  /* eslint-disable no-console */
  const path = Runtime.getFunctions()['auth'].path;
  const { isAllowed } = require(path);

  if (!isAllowed(event.token, context)) {
    // eslint-disable-next-line no-undef
    let response = new Twilio.Response();
    response.setStatusCode(401);
    response.appendHeader('Content-Type', 'application/json');
    response.setBody({ 'message': 'Unauthorized' });

    callback(null, response);
    return;
  }
  const client = context.getTwilioClient();
  const flowSid = context.FLOW_SID;

  client.studio.v1.flows(flowSid).executions.list({ limit: 100 })
    .then((executions) => {
      if (executions.length > 0) {
        const endedExecutions = executions.filter((e) => e.status === 'ended');
        const promises = endedExecutions.map((e) => new Promise((resolve, reject) => {
          client.studio.flows(flowSid)
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
                console.log(err);
                // This happens when there's an incomplete studio execution. Resolving null will be handled gracefully in the front-end.
                resolve(null);
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
      } else {
        callback(null, []);
      }
    })
    .catch((err) => callback(err));
};
