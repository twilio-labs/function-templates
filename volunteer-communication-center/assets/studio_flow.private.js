const flowDefinition = {
  "description": "VoiceToFlex",
  "states": [
    {
      "name": "Trigger",
      "type": "trigger",
      "transitions": [
        {
          "next": "SMSAutopilot",
          "event": "incomingMessage"
        },
        {
          "next": "VoiceAutopilot",
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
      "name": "VoiceAutopilot",
      "type": "send-to-auto-pilot",
      "transitions": [
        {
          "next": "VoiceCheckTask",
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
      "name": "VoiceCheckTask",
      "type": "split-based-on",
      "transitions": [
        {
          "event": "noMatch"
        },
        {
          "next": "Confirmation",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to talk-to-agent",
              "arguments": [
                "{{widgets.VoiceAutopilot.CurrentTask}}"
              ],
              "type": "equal_to",
              "value": "send_to_agent"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{widgets.VoiceAutopilot.CurrentTask}}",
        "offset": {
          "x": 190,
          "y": 460
        }
      }
    },
    {
      "name": "FlexCall",
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
          "x": 280,
          "y": 1340
        },
        "workflow": "WW2cc9ef4cbd96328adf7e90e4e1fef1c0",
        "channel": "TC3452ca1f798eb88a0a6a8d85114093fd",
        "attributes": "{ \"type\": \"inbound\", \"name\": \"{{trigger.call.From}}\" }"
      }
    },
    {
      "name": "Confirmation",
      "type": "gather-input-on-call",
      "transitions": [
        {
          "next": "PleaseHold",
          "event": "keypress"
        },
        {
          "event": "speech"
        },
        {
          "next": "ReturnAutopilot",
          "event": "timeout"
        }
      ],
      "properties": {
        "number_of_digits": 1,
        "speech_timeout": "auto",
        "offset": {
          "x": 260,
          "y": 720
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
      "name": "PleaseHold",
      "type": "say-play",
      "transitions": [
        {
          "next": "FlexCall",
          "event": "audioComplete"
        }
      ],
      "properties": {
        "offset": {
          "x": 250,
          "y": 1030
        },
        "loop": 1,
        "say": "Now connecting you with a [coordinator]. Please hold."
      }
    },
    {
      "name": "SMSAutopilot",
      "type": "send-to-auto-pilot",
      "transitions": [
        {
          "next": "SMSCheckTask",
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
      "name": "SMSCheckTask",
      "type": "split-based-on",
      "transitions": [
        {
          "event": "noMatch"
        },
        {
          "next": "AskToCoordinator",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to send_to_agent",
              "arguments": [
                "{{widgets.VoiceAutopilot.CurrentTask}}"
              ],
              "type": "equal_to",
              "value": "send_to_agent"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{widgets.VoiceAutopilot.CurrentTask}}",
        "offset": {
          "x": -340,
          "y": 460
        }
      }
    },
    {
      "name": "AskToCoordinator",
      "type": "send-and-wait-for-reply",
      "transitions": [
        {
          "next": "CheckResponse",
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
          "y": 720
        },
        "service": "{{trigger.message.InstanceSid}}",
        "channel": "{{trigger.message.ChannelSid}}",
        "from": "{{flow.channel.address}}",
        "body": "If you would like to connect to a [coordinator], please reply \"coordinator\". To continue with Henry, please reply \"Henry\".",
        "timeout": "3600"
      }
    },
    {
      "name": "CheckResponse",
      "type": "split-based-on",
      "transitions": [
        {
          "event": "noMatch"
        },
        {
          "next": "IfCoordinator",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to coordinator",
              "arguments": [
                "{{widgets.AskToCoordinator.inbound.Body}}"
              ],
              "type": "equal_to",
              "value": "coordinator"
            }
          ]
        },
        {
          "next": "ReturnAutopilotSMS",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to Henry",
              "arguments": [
                "{{widgets.AskToCoordinator.inbound.Body}}"
              ],
              "type": "equal_to",
              "value": "Henry"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{widgets.AskToCoordinator.inbound.Body}}",
        "offset": {
          "x": -400,
          "y": 1030
        }
      }
    },
    {
      "name": "ReturnAutopilotSMS",
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
          "x": -120,
          "y": 1350
        },
        "autopilot_assistant_sid": "UA232372d4ebf310e2eedd7bcc099966e1",
        "from": "{{flow.channel.address}}",
        "chat_service": "{{trigger.message.InstanceSid}}",
        "body": "{{trigger.message.Body}}",
        "timeout": 14400
      }
    },
    {
      "name": "IfCoordinator",
      "type": "send-message",
      "transitions": [
        {
          "next": "GoToFlex",
          "event": "sent"
        },
        {
          "event": "failed"
        }
      ],
      "properties": {
        "offset": {
          "x": -500,
          "y": 1360
        },
        "service": "{{trigger.message.InstanceSid}}",
        "channel": "{{trigger.message.ChannelSid}}",
        "from": "{{flow.channel.address}}",
        "to": "{{contact.channel.address}}",
        "body": "Redirecting to a coordinator now. Someone will respond when available."
      }
    },
    {
      "name": "GoToFlex",
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
          "x": -490,
          "y": 1620
        },
        "workflow": "WW2cc9ef4cbd96328adf7e90e4e1fef1c0",
        "channel": "TC1538a54edef5895fcc2115489151e390",
        "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\"}"
      }
    },
    {
      "name": "ReturnAutopilot",
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
          "x": 660,
          "y": 1030
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