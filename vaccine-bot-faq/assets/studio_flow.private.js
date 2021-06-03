const flowDefinition = {
  "description": "Twilio Dialogflow Chatbot",
  "states": [
    {
      "name": "Trigger",
      "type": "trigger",
      "transitions": [
        {
          "next": "SetUtteranceVariable",
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
      "name": "SetUtteranceVariable",
      "type": "set-variables",
      "transitions": [
        {
          "next": "DialogflowDetectIntent",
          "event": "next"
        }
      ],
      "properties": {
        "variables": [
          {
            "value": "{{trigger.message.Body}}",
            "key": "utterance"
          }
        ],
        "offset": {
          "x": -50,
          "y": 200
        }
      }
    },
    {
      "name": "DialogflowDetectIntent",
      "type": "run-function",
      "transitions": [
        {
          "next": "SetDialogflowSessionId",
          "event": "success"
        },
        {
          "event": "fail"
        }
      ],
      "properties": {
        "offset": {
          "x": 20,
          "y": 470
        },
        "parameters": [
          {
            "value": "{{flow.variables.utterance}}",
            "key": "utterance"
          },
          {
            "value": "{{flow.variables.dialogflow_session_id}}",
            "key": "dialogflow_session_id"
          }
        ],
        "url": ""
      }
    },
    {
      "name": "AnyFurtherQuestionsAndWait",
      "type": "send-and-wait-for-reply",
      "transitions": [
        {
          "next": "ResetUtteranceVariable",
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
          "x": -590,
          "y": 1170
        },
        "service": "{{trigger.message.InstanceSid}}",
        "channel": "{{trigger.message.ChannelSid}}",
        "from": "{{flow.channel.address}}",
        "body": "Do you have any questions about the vaccine?",
        "timeout": "3600"
      }
    },
    {
      "name": "Check_EndSession",
      "type": "split-based-on",
      "transitions": [
        {
          "next": "SendDialogflowAnswer",
          "event": "noMatch"
        },
        {
          "next": "SendFinalMessage",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "Wants Agent",
              "arguments": [
                "{{widgets.DialogflowDetectIntent.parsed.intent.displayName}}"
              ],
              "type": "equal_to",
              "value": "VaccineFAQ.End Session"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{widgets.DialogflowDetectIntent.parsed.intent.displayName}}",
        "offset": {
          "x": 80,
          "y": 910
        }
      }
    },
    {
      "name": "ResetUtteranceVariable",
      "type": "set-variables",
      "transitions": [
        {
          "next": "DialogflowDetectIntent",
          "event": "next"
        }
      ],
      "properties": {
        "variables": [
          {
            "value": "{{widgets.AnyFurtherQuestionsAndWait.inbound.Body}}",
            "key": "utterance"
          }
        ],
        "offset": {
          "x": -720,
          "y": 450
        }
      }
    },
    {
      "name": "SetDialogflowSessionId",
      "type": "set-variables",
      "transitions": [
        {
          "next": "Check_EndSession",
          "event": "next"
        }
      ],
      "properties": {
        "variables": [
          {
            "value": "{{widgets.DialogflowDetectIntent.parsed.session_id}}",
            "key": "dialogflow_session_id"
          }
        ],
        "offset": {
          "x": -260,
          "y": 700
        }
      }
    },
    {
      "name": "SendFinalMessage",
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
          "x": 470,
          "y": 1190
        },
        "service": "{{trigger.message.InstanceSid}}",
        "channel": "{{trigger.message.ChannelSid}}",
        "from": "{{flow.channel.address}}",
        "to": "{{contact.channel.address}}",
        "body": "Thank you for using Vaccine FAQ bot!"
      }
    },
    {
      "name": "SendDialogflowAnswer",
      "type": "send-message",
      "transitions": [
        {
          "next": "AnyFurtherQuestionsAndWait",
          "event": "sent"
        },
        {
          "event": "failed"
        }
      ],
      "properties": {
        "offset": {
          "x": -160,
          "y": 1170
        },
        "service": "{{trigger.message.InstanceSid}}",
        "channel": "{{trigger.message.ChannelSid}}",
        "from": "{{flow.channel.address}}",
        "to": "{{contact.channel.address}}",
        "body": "{{widgets.DialogflowDetectIntent.parsed.fulfillmentText}}"
      }
    }
  ],
  "initial_state": "Trigger",
  "flags": {
    "allow_concurrent_calls": true
  }
};

module.exports = flowDefinition;