
const flowDefinition = {
  "description": "SMStoFlex",
  "states": [
    {
      "name": "Trigger",
      "type": "trigger",
      "transitions": [
        {
          "next": "AutopilotFAQbot",
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
      "name": "AutopilotFAQbot",
      "type": "send-to-auto-pilot",
      "transitions": [
        {
          "next": "CheckTask",
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
          "x": 0,
          "y": 160
        },
        "autopilot_assistant_sid": "UA232372d4ebf310e2eedd7bcc099966e1",
        "from": "{{flow.channel.address}}",
        "chat_service": "{{trigger.message.InstanceSid}}",
        "body": "{{trigger.message.Body}}",
        "timeout": 14400
      }
    },
    {
      "name": "CheckTask",
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
                "{{widgets.AutopilotFAQbot.CurrentTask}}"
              ],
              "type": "equal_to",
              "value": "send_to_agent"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{widgets.AutopilotFAQbot.CurrentTask}}",
        "offset": {
          "x": 30,
          "y": 390
        }
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
          "next": "NoAgentsAvailable",
          "event": "failedToEnqueue"
        },
        {
          "next": "NoAgentsAvailable",
          "event": "callFailure"
        }
      ],
      "properties": {
        "offset": {
          "x": 0,
          "y": 1330
        },
        "workflow": "WW2cc9ef4cbd96328adf7e90e4e1fef1c0",
        "channel": "TC1538a54edef5895fcc2115489151e390",
        "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\"}",
        "waitUrlMethod": "POST"
      }
    },
    {
      "name": "NoAgentsAvailable",
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
          "x": 160,
          "y": 1570
        },
        "service": "{{trigger.message.InstanceSid}}",
        "channel": "{{trigger.message.ChannelSid}}",
        "from": "{{flow.channel.address}}",
        "to": "{{contact.channel.address}}",
        "body": "We're sorry, no agent is available right now."
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
          "x": 210,
          "y": 620
        },
        "service": "{{trigger.message.InstanceSid}}",
        "channel": "{{trigger.message.ChannelSid}}",
        "from": "{{flow.channel.address}}",
        "body": "If you would like to connect to a [coordinator], please reply YES. To continue with Henry, please reply NO.",
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
          "next": "If_Yes",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to YES",
              "arguments": [
                "{{widgets.GoToCoordinator?.inbound.Body}}"
              ],
              "type": "equal_to",
              "value": "YES"
            }
          ]
        },
        {
          "next": "If_No",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to NO",
              "arguments": [
                "{{widgets.GoToCoordinator?.inbound.Body}}"
              ],
              "type": "equal_to",
              "value": "NO"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{widgets.GoToCoordinator?.inbound.Body}}",
        "offset": {
          "x": 210,
          "y": 840
        }
      }
    },
    {
      "name": "If_Yes",
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
          "x": -10,
          "y": 1100
        },
        "service": "{{trigger.message.InstanceSid}}",
        "channel": "{{trigger.message.ChannelSid}}",
        "from": "{{flow.channel.address}}",
        "to": "{{contact.channel.address}}",
        "body": "Redirecting a coordinator now. Someone will respond when available."
      }
    },
    {
      "name": "If_No",
      "type": "send-message",
      "transitions": [
        {
          "next": "AutopilotFAQbot",
          "event": "sent"
        },
        {
          "event": "failed"
        }
      ],
      "properties": {
        "offset": {
          "x": 450,
          "y": 1090
        },
        "service": "{{trigger.message.InstanceSid}}",
        "channel": "{{trigger.message.ChannelSid}}",
        "from": "{{flow.channel.address}}",
        "to": "{{contact.channel.address}}",
        "body": "Connecting you back to Henry."
      }
    }
  ],
  "initial_state": "Trigger",
  "flags": {
    "allow_concurrent_calls": true
  }
}

module.exports = flowDefinition;