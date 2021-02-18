const flowDefinition = {
      description: 'A New Flow',
      states: [
        {
          name: 'Trigger',
          type: 'trigger',
          transitions: [
            {
              next: 'Welcome',
              event: 'incomingMessage',
            },
            {
              event: 'incomingCall',
            },
            {
              event: 'incomingRequest',
            },
          ],
          properties: {
            offset: {
              x: 0,
              y: 0,
            },
          },
        },
        {
          name: 'Welcome',
          type: 'send-and-wait-for-reply',
          transitions: [
            {
              next: 'OptIn',
              event: 'incomingMessage',
            },
            {
              event: 'timeout',
            },
            {
              event: 'deliveryFailure',
            },
          ],
          properties: {
            offset: {
              x: -20,
              y: 200,
            },
            service: '{{trigger.message.InstanceSid}}',
            channel: '{{trigger.message.ChannelSid}}',
            from: '{{flow.channel.address}}',
            body: 'You can get notified when it’s your turn to get the COVID-19 vaccine by [YOUR ORG NAME HERE].\n\nYou will be asked a few basic questions based on the CDC’s vaccine rollout recommendations, then you will be notified when you are eligible to make an appointment to receive your first dose.\n\nTo continue, reply “YES” or reply "STOP" to unsubscribe.',
            timeout: '3600',
          },
        },
        {
          name: 'Name',
          type: 'send-and-wait-for-reply',
          transitions: [
            {
              next: 'Age',
              event: 'incomingMessage',
            },
            {
              event: 'timeout',
            },
            {
              event: 'deliveryFailure',
            },
          ],
          properties: {
            offset: {
              x: -10,
              y: 690,
            },
            service: '{{trigger.message.InstanceSid}}',
            channel: '{{trigger.message.ChannelSid}}',
            from: '{{flow.channel.address}}',
            body: 'What is your full name?',
            timeout: '3600',
          },
        },
        {
          name: 'OptIn',
          type: 'split-based-on',
          transitions: [
            {
              next: 'Welcome',
              event: 'noMatch',
            },
            {
              next: 'Name',
              event: 'match',
              conditions: [
                {
                  friendly_name: 'If value equal_to yes',
                  arguments: [
                    '{{widgets.Welcome.inbound.Body}}',
                  ],
                  type: 'equal_to',
                  value: 'yes',
                },
              ],
            },
          ],
          properties: {
            input: '{{widgets.Welcome.inbound.Body}}',
            offset: {
              x: -20,
              y: 440,
            },
          },
        },
        {
          name: 'Age',
          type: 'send-and-wait-for-reply',
          transitions: [
            {
              next: 'ZipCode',
              event: 'incomingMessage',
            },
            {
              event: 'timeout',
            },
            {
              event: 'deliveryFailure',
            },
          ],
          properties: {
            offset: {
              x: -10,
              y: 950,
            },
            service: '{{trigger.message.InstanceSid}}',
            channel: '{{trigger.message.ChannelSid}}',
            from: '{{flow.channel.address}}',
            body: 'OK, {{widgets.Name.inbound.Body}}, how old are you?',
            timeout: '3600',
          },
        },
        {
          name: 'EssentialWorker',
          type: 'send-and-wait-for-reply',
          transitions: [
            {
              next: 'WorkFromHome',
              event: 'incomingMessage',
            },
            {
              event: 'timeout',
            },
            {
              event: 'deliveryFailure',
            },
          ],
          properties: {
            offset: {
              x: -10,
              y: 1260,
            },
            service: '{{trigger.message.InstanceSid}}',
            channel: '{{trigger.message.ChannelSid}}',
            from: '{{flow.channel.address}}',
            body: 'Thanks. Are you considered an essential worker? \n\nReply "YES" or "NO"\n\nFor more info on categories of essential workers, see: https://www.cdc.gov/vaccines/covid-19/categories-essential-workers.html',
            timeout: '3600',
          },
        },
        {
          name: 'WorkFromHome',
          type: 'send-and-wait-for-reply',
          transitions: [
            {
              next: 'LongTermCare',
              event: 'incomingMessage',
            },
            {
              event: 'timeout',
            },
            {
              event: 'deliveryFailure',
            },
          ],
          properties: {
            offset: {
              x: -10,
              y: 1490,
            },
            service: '{{trigger.message.InstanceSid}}',
            channel: '{{trigger.message.ChannelSid}}',
            from: '{{flow.channel.address}}',
            body: 'Do you currently work from home? \n\nReply "YES" or "NO"',
            timeout: '3600',
          },
        },
        {
          name: 'LongTermCare',
          type: 'send-and-wait-for-reply',
          transitions: [
            {
              next: 'CongregateSetting',
              event: 'incomingMessage',
            },
            {
              event: 'timeout',
            },
            {
              event: 'deliveryFailure',
            },
          ],
          properties: {
            offset: {
              x: -10,
              y: 1740,
            },
            service: '{{trigger.message.InstanceSid}}',
            channel: '{{trigger.message.ChannelSid}}',
            from: '{{flow.channel.address}}',
            body: 'Do you live in a nursing home, assisted living, or a residential care facility? \n\nReply "YES" or "NO"',
            timeout: '3600',
          },
        },
        {
          name: 'CongregateSetting',
          type: 'send-and-wait-for-reply',
          transitions: [
            {
              next: 'HealthCondition',
              event: 'incomingMessage',
            },
            {
              event: 'timeout',
            },
            {
              event: 'deliveryFailure',
            },
          ],
          properties: {
            offset: {
              x: -10,
              y: 1980,
            },
            service: '{{trigger.message.InstanceSid}}',
            channel: '{{trigger.message.ChannelSid}}',
            from: '{{flow.channel.address}}',
            body: 'Do you live in a congregate setting, like a group home, single room occupancy (SRO) or shelter?\n\nReply "YES" or "NO"',
            timeout: '3600',
          },
        },
        {
          name: 'HealthCondition',
          type: 'send-and-wait-for-reply',
          transitions: [
            {
              next: 'NotificationPreference',
              event: 'incomingMessage',
            },
            {
              event: 'timeout',
            },
            {
              event: 'deliveryFailure',
            },
          ],
          properties: {
            offset: {
              x: -10,
              y: 2220,
            },
            service: '{{trigger.message.InstanceSid}}',
            channel: '{{trigger.message.ChannelSid}}',
            from: '{{flow.channel.address}}',
            body: 'Do you have one or more health conditions that can increase risk of severe COVID-19 illness?\n\nReply "YES" or "NO"\n\nFor more info on qualifying conditions, see: https://www.cdc.gov/coronavirus/2019-ncov/need-extra-precautions/people-with-medical-conditions.html',
            timeout: '3600',
          },
        },
        {
          name: 'NotificationPreference',
          type: 'send-and-wait-for-reply',
          transitions: [
            {
              next: 'ValidateNotificationPref',
              event: 'incomingMessage',
            },
            {
              event: 'timeout',
            },
            {
              event: 'deliveryFailure',
            },
          ],
          properties: {
            offset: {
              x: -10,
              y: 2460,
            },
            service: '{{trigger.message.InstanceSid}}',
            channel: '{{trigger.message.ChannelSid}}',
            from: '{{flow.channel.address}}',
            body: "When it's your turn, would you like to be notified via SMS or Email? \n\nReply \"1\" for SMS and \"2\" for Email.",
            timeout: '3600',
          },
        },
        {
          name: 'ValidateNotificationPref',
          type: 'split-based-on',
          transitions: [
            {
              event: 'noMatch',
            },
            {
              next: 'LanguagePreference',
              event: 'match',
              conditions: [
                {
                  friendly_name: '1',
                  arguments: [
                    '{{widgets.NotificationPreference.inbound.Body}}',
                  ],
                  type: 'equal_to',
                  value: '1',
                },
              ],
            },
            {
              next: 'GetEmail',
              event: 'match',
              conditions: [
                {
                  friendly_name: '2',
                  arguments: [
                    '{{widgets.NotificationPreference.inbound.Body}}',
                  ],
                  type: 'equal_to',
                  value: '2',
                },
              ],
            },
          ],
          properties: {
            input: '{{widgets.NotificationPreference.inbound.Body}}',
            offset: {
              x: 0,
              y: 2690,
            },
          },
        },
        {
          name: 'GetEmail',
          type: 'send-and-wait-for-reply',
          transitions: [
            {
              next: 'LanguagePreference',
              event: 'incomingMessage',
            },
            {
              event: 'timeout',
            },
            {
              event: 'deliveryFailure',
            },
          ],
          properties: {
            offset: {
              x: 300,
              y: 2950,
            },
            service: '{{trigger.message.InstanceSid}}',
            channel: '{{trigger.message.ChannelSid}}',
            from: '{{flow.channel.address}}',
            body: 'What is your email address?',
            timeout: '3600',
          },
        },
        {
          name: 'Goodbye',
          type: 'send-message',
          transitions: [
            {
              event: 'sent',
            },
            {
              event: 'failed',
            },
          ],
          properties: {
            offset: {
              x: 60,
              y: 3460,
            },
            service: '{{trigger.message.InstanceSid}}',
            channel: '{{trigger.message.ChannelSid}}',
            from: '{{flow.channel.address}}',
            to: '{{contact.channel.address}}',
            body: "Thank you, you are now on the [YOUR ORG NAME HERE] vaccine standby list.\n\nWe will notify you when you're eligible to receive a vaccine.",
          },
        },
        {
          name: 'LanguagePreference',
          type: 'send-and-wait-for-reply',
          transitions: [
            {
              next: 'Goodbye',
              event: 'incomingMessage',
            },
            {
              event: 'timeout',
            },
            {
              event: 'deliveryFailure',
            },
          ],
          properties: {
            offset: {
              x: 60,
              y: 3210,
            },
            service: '{{trigger.message.InstanceSid}}',
            channel: '{{trigger.message.ChannelSid}}',
            from: '{{flow.channel.address}}',
            body: 'What is your preferred language?\n1. English\n2. Español\n3. 繁體中文\n\nReply"1", "2", or "3"',
            timeout: '3600',
          },
        },
        {
          name: 'ZipCode',
          type: 'send-and-wait-for-reply',
          transitions: [
            {
              next: 'EssentialWorker',
              event: 'incomingMessage',
            },
            {
              event: 'timeout',
            },
            {
              event: 'deliveryFailure',
            },
          ],
          properties: {
            offset: {
              x: 360,
              y: 1120,
            },
            service: '{{trigger.message.InstanceSid}}',
            channel: '{{trigger.message.ChannelSid}}',
            from: '{{flow.channel.address}}',
            body: 'What is your 5-digit zip code?',
            timeout: '3600',
          },
        },
      ],
      initial_state: 'Trigger',
      flags: {
        allow_concurrent_calls: true,
      },
    };

module.exports = flowDefinition;