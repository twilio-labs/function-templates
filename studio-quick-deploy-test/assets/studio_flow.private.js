/* eslint-disable camelcase */
const flowDefinition = {
  description: 'A New Flow',
  flags: {
    allow_concurrent_calls: true,
  },
  status: 'published',
  timeout: 3600,
  initial_state: 'Trigger',
  states: [
    {
      type: 'trigger',
      name: 'Trigger',
      properties: {
        offset: {
          x: 380,
          y: 70,
        },
      },
      transitions: [
        {
          event: 'incomingMessage',
          next: 'send_message',
        },
        {
          event: 'incomingCall',
        },
        {
          event: 'incomingRequest',
        },
      ],
    },
    {
      type: 'send-message',
      name: 'send_message',
      properties: {
        offset: {
          x: 400,
          y: 240,
        },
        body: 'Thank you for your interest in this property! The open house is on Saturday from 1pm - 6pm.',
        from: '{{flow.channel.address}}',
        to: '{{contact.channel.address}}',
      },
      transitions: [
        {
          event: 'sent',
        },
        {
          event: 'failed',
        },
      ],
    },
  ],
};

module.exports = flowDefinition;
