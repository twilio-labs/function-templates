const crypto = require('crypto');

exports.handler = function(context, event, callback) {

    const SALT = 'salty';
    // Validate token before running
    function isAllowed(token) {
        // Create the token with the environment password
        const tokenString = `${context.ACCOUNT_SID}:${context.ADMIN_PASSWORD}:${SALT}`;

        // Similar to TwilioClient
        const originalToken = crypto
            .createHmac("sha1", context.AUTH_TOKEN)
            .update(Buffer.from(tokenString, "utf-8"))
            .digest("base64");
        
        return originalToken === token;
    }

    if(!isAllowed(event.token)) {
        response = new Twilio.response();
        response.status(403);
        response.message('unathorized')

        callback('unauthorized', response);
        return;
    }

    const client = context.getTwilioClient();

    client.studio.v1.flows(event.sid).executions.list({limit: 100})
        .then(executions => {
            if (executions.length > 0) {
                const endedExecutions = executions.filter((e) => e.status === 'ended');
                let promises = endedExecutions.map(e => {
                    return new Promise((resolve, reject) => {
                        client.studio.flows(event.sid)
                            .executions(e.sid)
                            .executionContext()
                            .fetch()
                            .then(execution_context => {
                                try {
                                    const executionContext = execution_context.context;
                                    let age = executionContext.widgets.Age.inbound.Body;
                                    let name = executionContext.widgets.Name.inbound.Body;
                                    let phone_number = executionContext.trigger.message.From;
                                    let zip_code = executionContext.widgets.ZipCode.inbound.Body;
                                    let essential_worker = executionContext.widgets.EssentialWorker.inbound.Body;
                                    let work_from_home = executionContext.widgets.WorkFromHome.inbound.Body;
                                    let long_term_care = executionContext.widgets.LongTermCare.inbound.Body;
                                    let congregate_setting = executionContext.widgets.CongregateSetting.inbound.Body;
                                    let health_condition = executionContext.widgets.HealthCondition.inbound.Body;
                                    let notification_preference = executionContext.widgets.NotificationPreference.inbound.Body;
                                    let language_preference = executionContext.widgets.LanguagePreference.inbound.Body;
                                    
                                    let resident = { 
                                        'name': name,
                                        'phone_number': phone_number,
                                        'age': age,
                                        'zip_code': zip_code,
                                        'essential_worker': essential_worker,
                                        'work_from_home': work_from_home,
                                        'long_term_care': long_term_care,
                                        'congregate_setting': congregate_setting,
                                        'health_condition': health_condition,
                                        'notification_preference': notification_preference,
                                        'language_preference': language_preference
                                    };
                                    resolve(resident);
                                } catch(e) {
                                    resolve();
                                }
                                
                            })
                            .catch(err => {
                                console.log(err);
                                reject(err);
                            });
                    });
                });
                
                Promise.all(promises).then((data) => {
                    callback(null, data)
                })
                .catch(err => callback(err));
            }
        })
        .catch(err => callback(err));

};