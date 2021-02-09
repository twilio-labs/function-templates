let flowDefinition = require('../sms-studio-flow.json');

exports.handler = async function(context, event, callback) {

    const client = context.getTwilioClient();

    // Get Serverless SID
    function getServiceSid() {
        console.log("Getting the Serverless Service SID.")
        return new Promise((resolve, reject) => {
            client.serverless.services
                .list({limit: 20})
                .then(services => {
                    services.forEach(s => {
                        if (s.friendlyName === "vaccine-standby-list") {
                            console.log(`Found vaccine standby list service: ${s.sid}.`)
                            resolve(s.sid);
                            return;
                        }
                    })

                    reject('Could not find Service SID. Did you change the friendly name from vaccine-standby-list to something else?')
                })
                .catch(err => reject(err));
        });
    }
    
    // Get Serverless Environment SID
    function getServerlessEnvironment(serviceSid) {
        console.log("Getting Serverless Environment SID.");
        return new Promise((resolve, reject) => {
            client.serverless.services(serviceSid)
                .environments
                .list({limit: 20})
                .then(environments => {
                    environments.forEach(e => {
                        // TODO: double check this is the environemnt that the Quickdeploy with launch with?
                        if (e.uniqueName === "dev-environment") {
                            console.log(`Found vaccine standby list environment: ${e.sid}.`);
                            resolve({sid: e.sid, domain: e.domainName});
                            return;
                        }
                    })
                    reject('Could not find environment SID')
                })
                .catch(err => reject(err));
        })
    }

    // Get Function SID
    function getFunctionSid(serviceSid) {
        console.log("Getting Serverless Function SID.");

        return new Promise((resolve, reject) => {
            client.serverless.services(serviceSid)
                .functions
                .list({limit: 20})
                .then(functions => {
                    functions.forEach(f => {
                        if (f.friendlyName === "/save-resident") {
                            resolve(f.sid);
                            return;
                        }
                    })

                    reject('Could not find environment SID')
                })
        })
    }

    // Append function widget to Studio Flow
    function formatStudioFlow(serviceSid, environmentDetails, functionSid) {

        let functionWidgetConfig = {
            "name": "SaveToAirtable",
            "type": "run-function",
            "transitions": [
                {
                "event": "success"
                },
                {
                "event": "fail"
                }
            ],
            "properties": {
                "service_sid": serviceSid,
                "environment_sid": environmentDetails.sid,
                "offset": {
                    "x": 60,
                    "y": 3710
                },
                "function_sid": functionSid,
                "parameters": [
                    {
                        "value": "{{widgets.Name.inbound.Body}}",
                        "key": "name"
                    },
                    {
                        "value": "{{widgets.NotificationPreference.inbound.Body}}",
                        "key": "notification_preference"
                    },
                    {
                        "value": "{{widgets.GetEmail.inbound.Body}}",
                        "key": "email"
                    },
                    {
                        "value": "{{trigger.message.From}}",
                        "key": "phone_number"
                    },
                    {
                        "value": "{{widgets.EssentialWorker.inbound.Body}}",
                        "key": "essential_worker"
                    },
                    {
                        "value": "{{widgets.WorkFromHome.inbound.To}}",
                        "key": "work_from_home"
                    },
                    {
                        "value": "{{widgets.ZipCode.inbound.Body}}",
                        "key": "zip_code"
                    },
                    {
                        "value": "{{widgets.LongTermCare.inbound.Body}}",
                        "key": "long_term_care"
                    },
                    {
                        "value": "{{widgets.CongregateSetting.inbound.Body}}",
                        "key": "congregate_setting"
                    },
                    {
                        "value": "{{widgets.HealthCondition.inbound.Body}}",
                        "key": "underlying_health_condition"
                    },
                    {
                        "value": "{{widgets.LanguagePreference.inbound.Body}",
                        "key": "language_preference"
                    }
                ],
                "url": `https://${environmentDetails.domain}/save-resident`
            }
        }

        let formattedFlow = flowDefinition;
        formattedFlow.states.push(functionWidgetConfig)
        
        return formattedFlow;
    }

    // Deploy Twilio Studio Flow
    function deployStudio(formattedFlow) {
        return new Promise((resolve, reject) => {
            client.studio.flows
                     .create({
                        commitMessage: 'Code Exchange automatic deploy',
                        friendlyName: 'Vaccine Standby Intake',
                        status: 'published',
                        definition: formattedFlow
                     })
                     .then(flow => {
                        resolve(flow.webhookUrl);
                     })
                     .catch(err => reject(err.details));;
        })
    }

    function getPhoneNumberSid() {
        return new Promise((resolve, reject) => {
            client.incomingPhoneNumbers
                .list({phoneNumber: context.TWILIO_PHONE_NUMBER, limit: 20})
                .then(incomingPhoneNumbers => {
                    let n = incomingPhoneNumbers[0];
                    resolve(n.sid)
                })
                .catch(err => reject(err));;
        })
    }

    function updatePhoneNumberWebhook(studioWebhook, numberSid) {
        return new Promise((resolve, reject) => {
            client.incomingPhoneNumbers(numberSid)
                .update({
                    smsUrl: studioWebhook
                })
                .then(d => {
                    console.log(`Successfully updated ${numberSid} to use ${studioWebhook}.`);
                    resolve('success')
                })
                .catch(err => reject(err));
        })
    }

    let serviceSid = await getServiceSid();
    let environmentDetails = await getServerlessEnvironment(serviceSid);
    let functionSid = await getFunctionSid(serviceSid);
    let formattedFlow = formatStudioFlow(serviceSid, environmentDetails, functionSid);
    let webhookUrl = await deployStudio(formattedFlow);
    let phoneNumberSid = await getPhoneNumberSid();
    let success = await updatePhoneNumberWebhook(webhookUrl, phoneNumberSid);

    callback(null, 'success');
    
};
