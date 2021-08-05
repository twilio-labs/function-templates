/* eslint-disable prefer-destructuring, dot-notation, consistent-return, spaced-comment */

const path0 = Runtime.getFunctions().helpers.path;
const { getParam, setParam } = require(path0);

exports.handler = function (context, event, callback) {
  const path = Runtime.getFunctions()['auth'].path;
  const { isValidAppToken } = require(path);

  if (!isValidAppToken(event.token, context)) {
    const response = new Twilio.Response();
    response.setStatusCode(401);
    response.appendHeader(
      'Error-Message',
      'Invalid or expired token. Please refresh the page and login again.'
    );
    response.appendHeader('Content-Type', 'application/json');
    response.setBody({ message: 'Unauthorized' });

    return callback(null, response);
  }

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  // Main function

  console.log(context);


  // Create an appointment object
  var ts = Math.round(new Date().getTime() / 1000);
  var tsTomorrow = ts + 24 * 3600;
  const appt_datetime = new Date(tsTomorrow * 1000);

  const appointment = {
    event_type: 'BOOKED',
    event_datetime_utc: null,
    patient_id: '1000',
    patient_first_name: event.firstName,
    patient_last_name: 'Doe',
    patient_phone: event.phoneNumber,
    provider_id: 'afauci',
    provider_first_name: 'Anthony',
    provider_last_name: 'Dr. Diaz',
    provider_callback_phone: '(800) 555-2222',
    appointment_location: 'Pacific Primary Care',
    appointment_id: '20000',
    appointment_timezone: '-0700',
    appointment_datetime: appt_datetime.toISOString(),
  };
  // Call studio flow with appointment
  console.log(appointment);
  createAppointment(context, appointment)
      .then(function() {
        response.setBody({});
        callback(null, response);

      })
      .catch(function(err) {
        console.log(err)
        callback(null);
      })
};

async function createAppointment(context, appointment) {
  context.TWILIO_FLOW_SID = await getParam(context, 'TWILIO_FLOW_SID');
  console.log(context.TWILIO_FLOW_SID);
  // ---------- execute flow
  const now = new Date();
  appointment.event_datetime_utc = now.toISOString();
  let params = {
    to: appointment.patient_phone,
    from: context.TWILIO_PHONE_NUMBER,
    parameters: appointment,
  };
  let response = await context
    .getTwilioClient()
    .studio.flows(context.TWILIO_FLOW_SID)
    .executions.create(params);
  const execution_sid = response.sid;

  // ---------- wait 10 sec to let flow execute
  await new Promise((resolve) => setTimeout(resolve, 10 * 1000));

  // ---------- if still active, stop flow
  response = await context
      .getTwilioClient()
      .studio.flows(context.TWILIO_FLOW_SID)
      .executions(execution_sid)
      .fetch();
  if (response.status === 'active') {
    // if 'active' wait 10 secs and stop flow execution
    await context
        .getTwilioClient()
        .studio.flows(context.TWILIO_FLOW_SID)
        .executions(execution_sid)
        .update({ status: 'ended' });
  }

}
