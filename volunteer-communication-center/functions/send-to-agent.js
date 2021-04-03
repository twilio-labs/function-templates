exports.handler = function(context, event, callback) {
 
  let memory = JSON.parse(event.Memory)
  console.log(memory)
  let responseObject
  let actions = []
  let say
  let verb

  for (const attribute in event) {
      console.log(attribute + ", " + event[attribute]);
  }

  // set flag for sending to agent
  remember = {
      "remember": {
          "sendToAgent": true
      }
  }

  actions.push(remember);

  //define response options
  say = {
      "say": "Please wait while I connect you with an agent. Testing"
  }

  actions.push(say);

  if (event.Channel == "voice") {
      // logic could be introduced here to send to different workflows
      // like a spanish or english workflow based on whats in memory
      verb = {
          "handoff": {
              "channel": "voice",
              "uri": "taskrouter://" + context.TWILIO_ANYONE_WORKFLOW_SID
          }
      };
      actions.push(verb);
  }
  // In the case of messaging, we are breaking out of the autopilot and returning
  // to the studio flow
  // In the case of voice, we are not returning any studio flow we are actually
  // transferring from within autopilot

  responseObject = {
      "actions": actions
  }

  console.log(JSON.stringify(responseObject));
  callback(null, responseObject);
};