
const flowDefinition = {
  "description": "A New Flow",
  "states": [
    {
      "name": "Trigger",
      "type": "trigger",
      "transitions": [
        {
          "next": "autopilot_1",
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
      "name": "autopilot_1",
      "type": "send-to-auto-pilot",
      "transitions": [
        {
          "next": "split_1",
          "event": "sessionEnded"
        },
        {
          "event": "failure"
        },
        {
          "event": "timeout"
        }
      ],
      "properties": {
        "chat_channel": "{{trigger.message.ChannelSid}}",
        "offset": {
          "x": -140,
          "y": 160
        },
        "autopilot_assistant_sid": "UA2ef3f645eece3a3d124a675aa14201bd",
        "from": "{{flow.channel.address}}",
        "chat_service": "{{trigger.message.InstanceSid}}",
        "body": "{{trigger.message.Body}}",
        "timeout": 14400
      }
    },
    {
      "name": "split_1",
      "type": "split-based-on",
      "transitions": [
        {
          "next": "send_message_1",
          "event": "noMatch"
        },
        {
          "next": "send_message_2",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to send_to_agent",
              "arguments": [
                "{{widgets.autopilot_1.CurrentTask}}"
              ],
              "type": "equal_to",
              "value": "send_to_agent"
            }
          ]
        },
        {
          "next": "send_message_2",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to text_try",
              "arguments": [
                "{{widgets.autopilot_1.CurrentTask}}"
              ],
              "type": "equal_to",
              "value": "text_try"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{widgets.autopilot_1.CurrentTask}}",
        "offset": {
          "x": -110,
          "y": 350
        }
      }
    },
    {
      "name": "send_to_flex_1",
      "type": "send-to-flex",
      "transitions": [
        {
          "event": "callComplete"
        },
        {
          "next": "send_message_3",
          "event": "failedToEnqueue"
        },
        {
          "event": "callFailure"
        }
      ],
      "properties": {
        "offset": {
          "x": 260,
          "y": 880
        },
        "workflow": "WW2cc9ef4cbd96328adf7e90e4e1fef1c0",
        "channel": "TC1538a54edef5895fcc2115489151e390",
        "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\"}",
        "waitUrlMethod": "POST"
      }
    },
    {
      "name": "send_message_1",
      "type": "send-message",
      "transitions": [
        {
          "event": "sent"
        },
        {
          "event": "failed"
        }
      ],
      "properties": {
        "offset": {
          "x": -390,
          "y": 550
        },
        "service": "{{trigger.message.InstanceSid}}",
        "channel": "{{trigger.message.ChannelSid}}",
        "from": "{{flow.channel.address}}",
        "to": "{{contact.channel.address}}",
        "body": "Sorry, I failed"
      }
    },
    {
      "name": "send_message_2",
      "type": "send-message",
      "transitions": [
        {
          "next": "send_to_flex_1",
          "event": "sent"
        },
        {
          "event": "failed"
        }
      ],
      "properties": {
        "offset": {
          "x": 140,
          "y": 660
        },
        "service": "{{trigger.message.InstanceSid}}",
        "channel": "{{trigger.message.ChannelSid}}",
        "from": "{{flow.channel.address}}",
        "to": "{{contact.channel.address}}",
        "body": "Trying to connect you in"
      }
    },
    {
      "name": "send_to_flex_2",
      "type": "send-to-flex",
      "transitions": [
        {
          "event": "callComplete"
        },
        {
          "next": "send_message_3",
          "event": "failedToEnqueue"
        },
        {
          "event": "callFailure"
        }
      ],
      "properties": {
        "offset": {
          "x": -567,
          "y": 124
        },
        "workflow": "WW2cc9ef4cbd96328adf7e90e4e1fef1c0",
        "channel": "TC1538a54edef5895fcc2115489151e390",
        "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\"}"
      }
    },
    {
      "name": "send_message_3",
      "type": "send-message",
      "transitions": [
        {
          "event": "sent"
        },
        {
          "event": "failed"
        }
      ],
      "properties": {
        "offset": {
          "x": -40,
          "y": 1100
        },
        "service": "{{trigger.message.InstanceSid}}",
        "channel": "{{trigger.message.ChannelSid}}",
        "from": "{{flow.channel.address}}",
        "to": "{{contact.channel.address}}",
        "body": "We're sorry, something went wrong"
      }
    }
  ],
  "initial_state": "Trigger",
  "flags": {
    "allow_concurrent_calls": true
  }
};

module.exports = flowDefinition;