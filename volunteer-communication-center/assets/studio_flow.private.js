const flowDefinition = {
  "description": "VoiceToFlex",
  "states": [
    {
      "name": "Trigger",
      "type": "trigger",
      "transitions": [
        {
          "next": "autopilot_2",
          "event": "incomingMessage"
        },
        {
          "next": "autopilot_1",
          "event": "incomingCall"
        },
        {
          "event": "incomingRequest"
        }
      ],
      "properties": {
        "offset": {
          "x": 10,
          "y": 10
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
          "x": 170,
          "y": 210
        },
        "autopilot_assistant_sid": "UA232372d4ebf310e2eedd7bcc099966e1",
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
          "event": "noMatch"
        },
        {
          "next": "gather_1",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to talk-to-agent",
              "arguments": [
                "{{widgets.autopilot_1.CurrentTask}}"
              ],
              "type": "equal_to",
              "value": "send_to_agent"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{widgets.autopilot_1.CurrentTask}}",
        "offset": {
          "x": 210,
          "y": 560
        }
      }
    },
    {
      "name": "send_to_flex_voice",
      "type": "send-to-flex",
      "transitions": [
        {
          "event": "callComplete"
        },
        {
          "event": "failedToEnqueue"
        },
        {
          "event": "callFailure"
        }
      ],
      "properties": {
        "offset": {
          "x": 710,
          "y": 1360
        },
        "workflow": "WW2cc9ef4cbd96328adf7e90e4e1fef1c0",
        "channel": "TC3452ca1f798eb88a0a6a8d85114093fd",
        "attributes": "{ \"type\": \"inbound\", \"name\": \"{{trigger.call.From}}\" }"
      }
    },
    {
      "name": "gather_1",
      "type": "gather-input-on-call",
      "transitions": [
        {
          "next": "say_play_1",
          "event": "keypress"
        },
        {
          "event": "speech"
        },
        {
          "next": "autopilot_4",
          "event": "timeout"
        }
      ],
      "properties": {
        "number_of_digits": 1,
        "speech_timeout": "auto",
        "offset": {
          "x": 890,
          "y": 820
        },
        "loop": 1,
        "finish_on_key": "#",
        "say": "Please press any key to speak to a [coordinator]. To return to Henry, please hold momentarily.",
        "stop_gather": true,
        "gather_language": "en",
        "profanity_filter": "true",
        "timeout": 6
      }
    },
    {
      "name": "say_play_1",
      "type": "say-play",
      "transitions": [
        {
          "next": "send_to_flex_voice",
          "event": "audioComplete"
        }
      ],
      "properties": {
        "offset": {
          "x": 810,
          "y": 1120
        },
        "loop": 1,
        "say": "Now connecting you with a [coordinator]. Please hold."
      }
    },
    {
      "name": "autopilot_2",
      "type": "send-to-auto-pilot",
      "transitions": [
        {
          "next": "split_2",
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
          "x": -286,
          "y": 188
        },
        "autopilot_assistant_sid": "UA232372d4ebf310e2eedd7bcc099966e1",
        "from": "{{flow.channel.address}}",
        "chat_service": "{{trigger.message.InstanceSid}}",
        "body": "{{trigger.message.Body}}",
        "timeout": 14400
      }
    },
    {
      "name": "split_2",
      "type": "split-based-on",
      "transitions": [
        {
          "next": "send_and_reply_1",
          "event": "noMatch"
        },
        {
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
        }
      ],
      "properties": {
        "input": "{{widgets.autopilot_1.CurrentTask}}",
        "offset": {
          "x": -342,
          "y": 413
        }
      }
    },
    {
      "name": "send_and_reply_1",
      "type": "send-and-wait-for-reply",
      "transitions": [
        {
          "next": "split_3",
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
          "x": -300,
          "y": 690
        },
        "service": "{{trigger.message.InstanceSid}}",
        "channel": "{{trigger.message.ChannelSid}}",
        "from": "{{flow.channel.address}}",
        "body": "If you would like to connect to a [coordinator], please reply \"coordinator\". To continue with Henry, please reply \"Henry\".",
        "timeout": "3600"
      }
    },
    {
      "name": "split_3",
      "type": "split-based-on",
      "transitions": [
        {
          "event": "noMatch"
        },
        {
          "next": "send_message_1",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to coordinator",
              "arguments": [
                "{{widgets.send_and_reply_1.inbound.Body}}"
              ],
              "type": "equal_to",
              "value": "coordinator"
            }
          ]
        },
        {
          "next": "autopilot_3",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to Henry",
              "arguments": [
                "{{widgets.send_and_reply_1.inbound.Body}}"
              ],
              "type": "equal_to",
              "value": "Henry"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{widgets.send_and_reply_1.inbound.Body}}",
        "offset": {
          "x": -331,
          "y": 893
        }
      }
    },
    {
      "name": "autopilot_3",
      "type": "send-to-auto-pilot",
      "transitions": [
        {
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
          "x": -22,
          "y": 1117
        },
        "autopilot_assistant_sid": "UA232372d4ebf310e2eedd7bcc099966e1",
        "from": "{{flow.channel.address}}",
        "chat_service": "{{trigger.message.InstanceSid}}",
        "body": "{{trigger.message.Body}}",
        "timeout": 14400
      }
    },
    {
      "name": "send_message_1",
      "type": "send-message",
      "transitions": [
        {
          "next": "send_to_flex_sms",
          "event": "sent"
        },
        {
          "event": "failed"
        }
      ],
      "properties": {
        "offset": {
          "x": -350,
          "y": 1190
        },
        "service": "{{trigger.message.InstanceSid}}",
        "channel": "{{trigger.message.ChannelSid}}",
        "from": "{{flow.channel.address}}",
        "to": "{{contact.channel.address}}",
        "body": "Redirecting to a coordinator now. Someone will respond when available."
      }
    },
    {
      "name": "send_to_flex_sms",
      "type": "send-to-flex",
      "transitions": [
        {
          "event": "callComplete"
        },
        {
          "event": "failedToEnqueue"
        },
        {
          "event": "callFailure"
        }
      ],
      "properties": {
        "offset": {
          "x": -374,
          "y": 1436
        },
        "workflow": "WW2cc9ef4cbd96328adf7e90e4e1fef1c0",
        "channel": "TC1538a54edef5895fcc2115489151e390",
        "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\"}"
      }
    },
    {
      "name": "autopilot_4",
      "type": "send-to-auto-pilot",
      "transitions": [
        {
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
          "x": 1210,
          "y": 1070
        },
        "autopilot_assistant_sid": "UA232372d4ebf310e2eedd7bcc099966e1",
        "from": "{{flow.channel.address}}",
        "chat_service": "{{trigger.message.InstanceSid}}",
        "body": "{{trigger.message.Body}}",
        "timeout": 14400
      }
    }
  ],
  "initial_state": "Trigger",
  "flags": {
    "allow_concurrent_calls": true
  }
}

module.exports = flowDefinition;