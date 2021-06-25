/* eslint-disable camelcase */
const flowDefinition = {
  description: 'Twilio Dialogflow Chatbot',
  states: [
    {
      name: 'Trigger',
      type: 'trigger',
      transitions: [
        {
          next: 'SetUtteranceVariable',
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
      name: 'SetUtteranceVariable',
      type: 'set-variables',
      transitions: [
        {
          next: 'DialogflowDetectIntent',
          event: 'next',
        },
      ],
      properties: {
        variables: [
          {
            value: '{{trigger.message.Body}}',
            key: 'utterance',
          },
        ],
        offset: {
          x: -50,
          y: 200,
        },
      },
    },
    {
      name: 'DialogflowDetectIntent',
      type: 'run-function',
      transitions: [
        {
          next: 'SetDialogflowSessionId',
          event: 'success',
        },
        {
          event: 'fail',
        },
      ],
      properties: {
        offset: {
          x: 20,
          y: 470,
        },
        parameters: [
          {
            value: '{{flow.variables.utterance}}',
            key: 'utterance',
          },
          {
            value: '{{flow.variables.dialogflow_session_id}}',
            key: 'dialogflow_session_id',
          },
        ],
        url: '',
      },
    },
    {
      name: 'Check_EndSession',
      type: 'split-based-on',
      transitions: [
        {
          next: 'SendWaitDialogflowAnswer',
          event: 'noMatch',
        },
        {
          next: 'SendFinalMessage',
          event: 'match',
          conditions: [
            {
              friendly_name: 'Wants Agent',
              arguments: [
                '{{widgets.DialogflowDetectIntent.parsed.fulfillmentText}}',
              ],
              type: 'equal_to',
              value: 'Thank you for using the Vaccine chatbot.',
            },
          ],
        },
        {
          next: 'SendWaitRephrase',
          event: 'match',
          conditions: [
            {
              friendly_name: 'Rephrase',
              arguments: [
                '{{widgets.DialogflowDetectIntent.parsed.fulfillmentText}}',
              ],
              type: 'is_blank',
              value: 'Is Blank',
            },
          ],
        },
        {
          next: 'WelcomeMessage',
          event: 'match',
          conditions: [
            {
              friendly_name: 'Greetings',
              arguments: [
                '{{widgets.DialogflowDetectIntent.parsed.fulfillmentText}}',
              ],
              type: 'equal_to',
              value:
                'Greetings! I am Vaccine chatbot. You can ask me questions about COVID-19 vaccines such as vaccine safety, side effects, immunity and allergies.',
            },
          ],
        },
      ],
      properties: {
        input: '{{widgets.DialogflowDetectIntent.parsed.fulfillmentText}}',
        offset: {
          x: 80,
          y: 920,
        },
      },
    },
    {
      name: 'ResetUtteranceVariable',
      type: 'set-variables',
      transitions: [
        {
          next: 'DialogflowDetectIntent',
          event: 'next',
        },
      ],
      properties: {
        variables: [
          {
            value: '{{widgets.SendWaitDialogflowAnswer.inbound.Body}}',
            key: 'utterance',
          },
        ],
        offset: {
          x: -990,
          y: 660,
        },
      },
    },
    {
      name: 'SetDialogflowSessionId',
      type: 'set-variables',
      transitions: [
        {
          next: 'Check_EndSession',
          event: 'next',
        },
      ],
      properties: {
        variables: [
          {
            value: '{{widgets.DialogflowDetectIntent.parsed.session_id}}',
            key: 'dialogflow_session_id',
          },
        ],
        offset: {
          x: -260,
          y: 700,
        },
      },
    },
    {
      name: 'SendFinalMessage',
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
          x: -330,
          y: 1490,
        },
        service: '{{trigger.message.InstanceSid}}',
        channel: '{{trigger.message.ChannelSid}}',
        from: '{{flow.channel.address}}',
        to: '{{contact.channel.address}}',
        body: 'Thank you for using Vaccine FAQ bot!',
      },
    },
    {
      name: 'SendWaitDialogflowAnswer',
      type: 'send-and-wait-for-reply',
      transitions: [
        {
          next: 'ResetUtteranceVariable',
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
          x: -710,
          y: 1210,
        },
        service: '{{trigger.message.InstanceSid}}',
        channel: '{{trigger.message.ChannelSid}}',
        from: '{{flow.channel.address}}',
        body: '{{widgets.DialogflowDetectIntent.parsed.fulfillmentText}}  \nDo you have any additional questions?',
        timeout: '3600',
      },
    },
    {
      name: 'SendWaitRephrase',
      type: 'send-and-wait-for-reply',
      transitions: [
        {
          next: 'ResetUtteranceVariableonRephrase',
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
          x: 240,
          y: 1470,
        },
        service: '{{trigger.message.InstanceSid}}',
        channel: '{{trigger.message.ChannelSid}}',
        from: '{{flow.channel.address}}',
        body: "Sorry, couldn't get it. Could you please rephrase your question?",
        timeout: '3600',
      },
    },
    {
      name: 'ResetUtteranceVariableonRephrase',
      type: 'set-variables',
      transitions: [
        {
          next: 'DialogflowDetectIntent',
          event: 'next',
        },
      ],
      properties: {
        variables: [
          {
            value: '{{widgets.SendWaitRephrase.inbound.Body}}',
            key: 'utterance',
          },
        ],
        offset: {
          x: 530,
          y: 640,
        },
      },
    },
    {
      name: 'WelcomeMessage',
      type: 'send-and-wait-for-reply',
      transitions: [
        {
          next: 'ResetUtteranceVariableonWelcome',
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
          x: 800,
          y: 1460,
        },
        service: '{{trigger.message.InstanceSid}}',
        channel: '{{trigger.message.ChannelSid}}',
        from: '{{flow.channel.address}}',
        body: '{{widgets.DialogflowDetectIntent.parsed.fulfillmentText}}',
        timeout: '3600',
      },
    },
    {
      name: 'ResetUtteranceVariableonWelcome',
      type: 'set-variables',
      transitions: [
        {
          next: 'DialogflowDetectIntent',
          event: 'next',
        },
      ],
      properties: {
        variables: [
          {
            value: '{{widgets.WelcomeMessage.inbound.Body}}',
            key: 'utterance',
          },
        ],
        offset: {
          x: 1020,
          y: 670,
        },
      },
    },
  ],
  initial_state: 'Trigger',
  flags: {
    allow_concurrent_calls: true,
  },
};

module.exports = flowDefinition;
