exports.handler = function(context, event, callback) {

    const client = context.getTwilioClient();

    client.studio.v1.flows(event.sid).executions.list({limit: 20})
        .then(executions => {
            if (executions.length > 0) {
                let promises = executions.map(e => {
                    return new Promise((resolve, reject) => {

                        client.studio.flows(event.sid)
                            .executions(e.sid)
                            .executionContext()
                            .fetch()
                            .then(execution_context => {
                                const executionContext = execution_context.context;
                                let age = executionContext.widgets.Age.inbound.Body;
                                let name = executionContext.widgets.Name.inbound.Body;
                                
                                let resident = { 'age': age, 'name': name }
                                console.log(resident)

                                resolve(resident);
                            })
                            .catch(err => reject(err));
                    });
                });
                
                console.log(promises);
                Promise.all(promises).then((data) => {
                    console.log('All promsies done');
                    console.log(data);
                    callback(null, data)
                })
                .catch(err => callback(err));
            }
        })
        .catch(err => callback(err));

};