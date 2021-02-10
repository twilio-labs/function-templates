exports.handler = async function(context, event, callback) {
    let flowDefinition = {
        "description": "A New Flow",
        "states": [
            {
            "name": "Trigger",
            "type": "trigger",
            "transitions": [
                {
                "next": "Welcome",
                "event": "incomingMessage"
                },
                {
                "event": "incomingCall"
                },
                {
                "event": "incomingRequest"
                }
            ],
            "properties": {
                "offset": {
                "x": 0,
                "y": 0
                }
            }
            },
            {
            "name": "Welcome",
            "type": "send-and-wait-for-reply",
            "transitions": [
                {
                "next": "OptIn",
                "event": "incomingMessage"
                },
                {
                "event": "timeout"
                },
                {
                "event": "deliveryFailure"
                }
            ],
            "properties": {
                "offset": {
                "x": -20,
                "y": 200
                },
                "service": "{{trigger.message.InstanceSid}}",
                "channel": "{{trigger.message.ChannelSid}}",
                "from": "{{flow.channel.address}}",
                "body": "You can get notified when it’s your turn to get the COVID-19 vaccine.\n\nYou will be asked a few basic questions based on the CDC’s vaccine rollout recommendations, then you will be notified when you are eligible to make an appointment with your healthcare provider to receive your first dose.\n\nTo continue, reply “YES”.",
                "timeout": "3600"
            }
            },
            {
            "name": "Name",
            "type": "send-and-wait-for-reply",
            "transitions": [
                {
                "next": "Age",
                "event": "incomingMessage"
                },
                {
                "event": "timeout"
                },
                {
                "event": "deliveryFailure"
                }
            ],
            "properties": {
                "offset": {
                "x": -10,
                "y": 690
                },
                "service": "{{trigger.message.InstanceSid}}",
                "channel": "{{trigger.message.ChannelSid}}",
                "from": "{{flow.channel.address}}",
                "body": "What is your full name?",
                "timeout": "3600"
            }
            },
            {
            "name": "OptIn",
            "type": "split-based-on",
            "transitions": [
                {
                "next": "Welcome",
                "event": "noMatch"
                },
                {
                "next": "Name",
                "event": "match",
                "conditions": [
                    {
                    "friendly_name": "If value equal_to yes",
                    "arguments": [
                        "{{widgets.Welcome.inbound.Body}}"
                    ],
                    "type": "equal_to",
                    "value": "yes"
                    }
                ]
                }
            ],
            "properties": {
                "input": "{{widgets.Welcome.inbound.Body}}",
                "offset": {
                "x": -20,
                "y": 440
                }
            }
            },
            {
            "name": "Age",
            "type": "send-and-wait-for-reply",
            "transitions": [
                {
                "next": "ZipCode",
                "event": "incomingMessage"
                },
                {
                "event": "timeout"
                },
                {
                "event": "deliveryFailure"
                }
            ],
            "properties": {
                "offset": {
                "x": -10,
                "y": 950
                },
                "service": "{{trigger.message.InstanceSid}}",
                "channel": "{{trigger.message.ChannelSid}}",
                "from": "{{flow.channel.address}}",
                "body": "OK, {{widgets.Name.inbound.Body}}, how old are you?",
                "timeout": "3600"
            }
            },
            {
            "name": "EssentialWorker",
            "type": "send-and-wait-for-reply",
            "transitions": [
                {
                "next": "WorkFromHome",
                "event": "incomingMessage"
                },
                {
                "event": "timeout"
                },
                {
                "event": "deliveryFailure"
                }
            ],
            "properties": {
                "offset": {
                "x": -10,
                "y": 1260
                },
                "service": "{{trigger.message.InstanceSid}}",
                "channel": "{{trigger.message.ChannelSid}}",
                "from": "{{flow.channel.address}}",
                "body": "Thanks. Are you considered an essential worker? Reply yes / no. \n\nSee www.mycounty.gov/essential-workers",
                "timeout": "3600"
            }
            },
            {
            "name": "WorkFromHome",
            "type": "send-and-wait-for-reply",
            "transitions": [
                {
                "next": "LongTermCare",
                "event": "incomingMessage"
                },
                {
                "event": "timeout"
                },
                {
                "event": "deliveryFailure"
                }
            ],
            "properties": {
                "offset": {
                "x": -10,
                "y": 1490
                },
                "service": "{{trigger.message.InstanceSid}}",
                "channel": "{{trigger.message.ChannelSid}}",
                "from": "{{flow.channel.address}}",
                "body": "Do you currently work from home? Reply yes/no.",
                "timeout": "3600"
            }
            },
            {
            "name": "LongTermCare",
            "type": "send-and-wait-for-reply",
            "transitions": [
                {
                "next": "CongregateSetting",
                "event": "incomingMessage"
                },
                {
                "event": "timeout"
                },
                {
                "event": "deliveryFailure"
                }
            ],
            "properties": {
                "offset": {
                "x": -10,
                "y": 1740
                },
                "service": "{{trigger.message.InstanceSid}}",
                "channel": "{{trigger.message.ChannelSid}}",
                "from": "{{flow.channel.address}}",
                "body": "Do you live in a nursing home, assisted living, or a residential care facility? Reply yes/no.",
                "timeout": "3600"
            }
            },
            {
            "name": "CongregateSetting",
            "type": "send-and-wait-for-reply",
            "transitions": [
                {
                "next": "HealthCondition",
                "event": "incomingMessage"
                },
                {
                "event": "timeout"
                },
                {
                "event": "deliveryFailure"
                }
            ],
            "properties": {
                "offset": {
                "x": -10,
                "y": 1980
                },
                "service": "{{trigger.message.InstanceSid}}",
                "channel": "{{trigger.message.ChannelSid}}",
                "from": "{{flow.channel.address}}",
                "body": "Do you live in a congregate setting, like a group home, single room occupancy (SRO) or shelter?",
                "timeout": "3600"
            }
            },
            {
            "name": "HealthCondition",
            "type": "send-and-wait-for-reply",
            "transitions": [
                {
                "next": "NotificationPreference",
                "event": "incomingMessage"
                },
                {
                "event": "timeout"
                },
                {
                "event": "deliveryFailure"
                }
            ],
            "properties": {
                "offset": {
                "x": -10,
                "y": 2220
                },
                "service": "{{trigger.message.InstanceSid}}",
                "channel": "{{trigger.message.ChannelSid}}",
                "from": "{{flow.channel.address}}",
                "body": "Do you have one or more health conditions that can increase risk of severe COVID-19 illness? Reply yes/no.\n\nSee the following list of conditions: https://www.cdc.gov/coronavirus/2019-ncov/need-extra-precautions/people-with-medical-conditions.html",
                "timeout": "3600"
            }
            },
            {
            "name": "NotificationPreference",
            "type": "send-and-wait-for-reply",
            "transitions": [
                {
                "next": "ValidateNotificationPref",
                "event": "incomingMessage"
                },
                {
                "event": "timeout"
                },
                {
                "event": "deliveryFailure"
                }
            ],
            "properties": {
                "offset": {
                "x": -10,
                "y": 2460
                },
                "service": "{{trigger.message.InstanceSid}}",
                "channel": "{{trigger.message.ChannelSid}}",
                "from": "{{flow.channel.address}}",
                "body": "When it's your turn, would you like to be notifified via SMS or email? Reply 1 for SMS and 2 for email.",
                "timeout": "3600"
            }
            },
            {
            "name": "ValidateNotificationPref",
            "type": "split-based-on",
            "transitions": [
                {
                "event": "noMatch"
                },
                {
                "next": "LanguagePreference",
                "event": "match",
                "conditions": [
                    {
                    "friendly_name": "1",
                    "arguments": [
                        "{{widgets.NotificationPreference.inbound.Body}}"
                    ],
                    "type": "equal_to",
                    "value": "1"
                    }
                ]
                },
                {
                "next": "GetEmail",
                "event": "match",
                "conditions": [
                    {
                    "friendly_name": "2",
                    "arguments": [
                        "{{widgets.NotificationPreference.inbound.Body}}"
                    ],
                    "type": "equal_to",
                    "value": "2"
                    }
                ]
                }
            ],
            "properties": {
                "input": "{{widgets.NotificationPreference.inbound.Body}}",
                "offset": {
                "x": 0,
                "y": 2690
                }
            }
            },
            {
            "name": "GetEmail",
            "type": "send-and-wait-for-reply",
            "transitions": [
                {
                "next": "LanguagePreference",
                "event": "incomingMessage"
                },
                {
                "event": "timeout"
                },
                {
                "event": "deliveryFailure"
                }
            ],
            "properties": {
                "offset": {
                "x": 300,
                "y": 2950
                },
                "service": "{{trigger.message.InstanceSid}}",
                "channel": "{{trigger.message.ChannelSid}}",
                "from": "{{flow.channel.address}}",
                "body": "What is your email address?",
                "timeout": "3600"
            }
            },
            {
            "name": "Goodbye",
            "type": "send-message",
            "transitions": [
                {
                "next": "SaveToAirtable",
                "event": "sent"
                },
                {
                "event": "failed"
                }
            ],
            "properties": {
                "offset": {
                "x": 60,
                "y": 3460
                },
                "service": "{{trigger.message.InstanceSid}}",
                "channel": "{{trigger.message.ChannelSid}}",
                "from": "{{flow.channel.address}}",
                "to": "{{contact.channel.address}}",
                "body": "Thank you, you're now on the vaccine wait-list. We'll reach out to you when you're eligible to receive a vaccine."
            }
            },
            {
            "name": "LanguagePreference",
            "type": "send-and-wait-for-reply",
            "transitions": [
                {
                "next": "Goodbye",
                "event": "incomingMessage"
                },
                {
                "event": "timeout"
                },
                {
                "event": "deliveryFailure"
                }
            ],
            "properties": {
                "offset": {
                "x": 60,
                "y": 3210
                },
                "service": "{{trigger.message.InstanceSid}}",
                "channel": "{{trigger.message.ChannelSid}}",
                "from": "{{flow.channel.address}}",
                "body": "What is your preferred language?\n1. English\n2. Español\n3. 繁體中文\n\nReply with 1, 2, or 3.",
                "timeout": "3600"
            }
            },
            {
            "name": "ZipCode",
            "type": "send-and-wait-for-reply",
            "transitions": [
                {
                "next": "EssentialWorker",
                "event": "incomingMessage"
                },
                {
                "event": "timeout"
                },
                {
                "event": "deliveryFailure"
                }
            ],
            "properties": {
                "offset": {
                "x": 360,
                "y": 1120
                },
                "service": "{{trigger.message.InstanceSid}}",
                "channel": "{{trigger.message.ChannelSid}}",
                "from": "{{flow.channel.address}}",
                "body": "What's your 5-digit zip code?",
                "timeout": "3600"
            }
            }
        ],
        "initial_state": "Trigger",
        "flags": {
            "allow_concurrent_calls": true
        }
    };

    const client = context.getTwilioClient();

    // Get Serverless SID
    function getServiceSid() {
        console.log("Getting the Serverless Service SID.")
        return new Promise((resolve, reject) => {
            client.serverless.services
                .list({limit: 20})
                .then(services => {
                    services.forEach(s => {
                        if (s.friendlyName === "vaccine-standby") {
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
                        if (e.uniqueName.includes("vaccine-standby")) {
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
                        "value": "{{widgets.LanguagePreference.inbound.Body}}",
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
