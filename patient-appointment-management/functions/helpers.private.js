/* eslint-disable camelcase, complexity, sonarjs/cognitive-complexity */
/*
 * --------------------------------------------------------------------------------
 * common helper function used by functions & client-side javascript
 *
 * getParam(context, key)
 * getParam(context, key)
 * setParam(context, key, value)
 *
 * include via:
 *   const path = Runtime.getFunctions()['helper'].path;
 *   const { getParam, setParam } = require(path);
 * and call functions directly
 *
 *
 * --------------------------------------------------------------------------------
 */

/*
 * --------------------------------------------------------------------------------
 * sets environment variable
 * --------------------------------------------------------------------------------
 */
const AWS = require('aws-sdk');

async function setParam(context, key, value) {
  const Twilio = require('twilio');

  const onLocalhost = Boolean(
    context.DOMAIN_NAME && context.DOMAIN_NAME.startsWith('localhost')
  );
  console.debug('Runtime environment is localhost:', onLocalhost);

  const client = context.getTwilioClient();
  // eslint-disable-next-line no-use-before-define
  const service_sid = await getParam(context, 'TWILIO_SERVICE_SID');
  // eslint-disable-next-line no-use-before-define
  const environment_sid = await getParam(context, 'TWILIO_ENVIRONMENT_SID');

  let variable_sid = null;
  await client.serverless
    .services(service_sid)
    .environments(environment_sid)
    .variables.list()
    .then((variables) =>
      variables.forEach((v) => {
        if (v.key === key) variable_sid = v.sid;
      })
    );

  if (variable_sid === null) {
    await client.serverless
      .services(service_sid)
      .environments(environment_sid)
      .variables.create({ key, value })
      .then((v) => console.log('Created variable', v.key));
  } else {
    await client.serverless
      .services(service_sid)
      .environments(environment_sid)
      .variables(variable_sid)
      .update({ value })
      .then((v) => console.log('Updated variable', v.key));
  }
  console.log('Assigned', key, '=', value);
}

/*
 * --------------------------------------------------------------------------------
 * retrieve environment variable from
 * - service environment (aka context)
 * - os for local development (via os.process)
 * - per resource-specific logic
 *   . TWILIO_SERVICE_SID from context, otherwise matching application name
 *   . TWILIO_ENVIRONMENT_SID from TWILIO_SERVICE_SID
 *   . TWILIO_ENVIRONMENT_DOMAIN_NAME from TWILIO_SERVICE_SID
 * --------------------------------------------------------------------------------
 */
async function getParam(context, key) {
  const THIS_APPLICATION_NAME = 'patient-appointment-management';
  const CONSTANTS = {
    APPLICATION_NAME: THIS_APPLICATION_NAME,
    FILENAME_APPOINTMENT:
      'appointment{appointment_id}-patient{patient_id}.json',
    _S3_BUCKET_BASE: `twilio-${THIS_APPLICATION_NAME}`,
    _CF_STACK_DEPLOYER_BASE: `twilio-${THIS_APPLICATION_NAME}-deployer`,
    _CF_STACK_BUCKET_BASE: `twilio-${THIS_APPLICATION_NAME}-bucket`,
    _CF_STACK_APPLICATION_BASE: `twilio-${THIS_APPLICATION_NAME}-application`,
    _GLUE_DATABASE_BASE: 'patient_appointments',
  };

  // first return context non-null context value
  if (context[key]) return context[key];

  // second return CONSTANTS value
  if (CONSTANTS[key]) {
    context[key] = CONSTANTS[key];
    return context[key];
  }

  const account_sid = context.ACCOUNT_SID
    ? context.ACCOUNT_SID
    : process.env.ACCOUNT_SID;
  const auth_token = context.AUTH_TOKEN
    ? context.AUTH_TOKEN
    : process.env.AUTH_TOKEN;
  const client = context.getTwilioClient();

  const AWS = require('aws-sdk');
  const options = {
    accessKeyId: context.DEPLOYER_AWS_ACCESS_KEY_ID,
    secretAccessKey: context.DEPLOYER_AWS_SECRET_ACCESS_KEY,
    region: context.AWS_REGION,
  };
  const SSM = new AWS.SSM(options);
  // ----------------------------------------------------------------------
  try {
    switch (key) {
      case 'DEPLOYER_AWS_ROLE_ARN': {
        const name = '/twilio/patient-appointment-management/deployer/role-arn';
        const data = await SSM.getParameter({ Name: name }).promise();
        return data.Parameter.Value;
      }
      case 'AWS_ACCESS_KEY_ID': {
        const name = `/twilio/patient-appointment-management-${context.CUSTOMER_CODE}/application/aws-secret`;
        const data = await SSM.getParameter({ Name: name }).promise();
        const secretName = data.Parameter.Value;

        const SM = new AWS.SecretsManager(options);
        const sdata = await SM.getSecretValue({
          SecretId: secretName,
        }).promise();
        const secret = JSON.parse(sdata.SecretString);
        return secret.AWS_ACCESS_KEY_ID;
      }
      case 'AWS_SECRET_ACCESS_KEY': {
        const name = `/twilio/patient-appointment-management-${context.CUSTOMER_CODE}/application/aws-secret`;
        const data = await SSM.getParameter({ Name: name }).promise();
        const secretName = data.Parameter.Value;

        const SM = new AWS.SecretsManager(options);
        const sdata = await SM.getSecretValue({
          SecretId: secretName,
        }).promise();
        const secret = JSON.parse(sdata.SecretString);
        return secret.AWS_SECRET_ACCESS_KEY;
      }
      case 'AWS_ATHENA_WORKGROUP': {
        const name = `/twilio/patient-appointment-management-${context.CUSTOMER_CODE}/application/athena-workgroup`;
        const data = await SSM.getParameter({ Name: name }).promise();
        return data.Parameter.Value;
      }
      case 'AWS_CF_STACK_APPLICATION': {
        return `${CONSTANTS._CF_STACK_APPLICATION_BASE}-${context.CUSTOMER_CODE}`;
      }
      case 'AWS_CF_STACK_BUCKET': {
        return `${CONSTANTS._CF_STACK_BUCKET_BASE}-${context.CUSTOMER_CODE}`;
      }
      case 'AWS_CF_STACK_DEPLOYER': {
        return `${CONSTANTS._CF_STACK_DEPLOYER_BASE}`;
      }
      case 'AWS_GLUE_CRAWLER': {
        const name = `/twilio/patient-appointment-management-${context.CUSTOMER_CODE}/application/crawler`;
        const data = await SSM.getParameter({ Name: name }).promise();
        return data.Parameter.Value;
      }
      case 'AWS_GLUE_DATABASE': {
        return `${CONSTANTS._GLUE_DATABASE_BASE}_${context.CUSTOMER_CODE}`;
      }
      case 'AWS_LAMBDA_SEND_REMINDERS': {
        const name = `/twilio/patient-appointment-management-${context.CUSTOMER_CODE}/application/lambda-send-reminders`;
        const data = await SSM.getParameter({ Name: name }).promise();
        return data.Parameter.Value;
      }
      case 'AWS_LAMBDA_QUERY_STATE': {
        const name = `/twilio/patient-appointment-management-${context.CUSTOMER_CODE}/application/lambda-query-state`;
        const data = await SSM.getParameter({ Name: name }).promise();
        return data.Parameter.Value;
      }
      case 'AWS_LAMBDA_QUERY_HISTORY': {
        const name = `/twilio/patient-appointment-management-${context.CUSTOMER_CODE}/application/lambda-query-history`;
        const data = await SSM.getParameter({ Name: name }).promise();
        return data.Parameter.Value;
      }
      case 'AWS_S3_BUCKET': {
        return `${CONSTANTS._S3_BUCKET_BASE}-${context.CUSTOMER_CODE}`;
      }
      case 'AWS_SECRET_AWS_ARN': {
        const name = `/twilio/patient-appointment-management-${context.CUSTOMER_CODE}/application/aws-secret`;
        const data = await SSM.getParameter({ Name: name }).promise();
        return data.Parameter.Value;
      }
      case 'AWS_SECRET_TWILIO_ARN': {
        const name = `/twilio/patient-appointment-management-${context.CUSTOMER_CODE}/application/twilio-secret`;
        const data = await SSM.getParameter({ Name: name }).promise();
        return data.Parameter.Value;
      }
      case 'AWS_SFN_QUERY_STATE': {
        const name = `/twilio/patient-appointment-management-${context.CUSTOMER_CODE}/application/sfn-query-state`;
        const data = await SSM.getParameter({ Name: name }).promise();
        return data.Parameter.Value;
      }
      case 'AWS_SFN_QUERY_HISTORY': {
        const name = `/twilio/patient-appointment-management-${context.CUSTOMER_CODE}/application/sfn-query-history`;
        const data = await SSM.getParameter({ Name: name }).promise();
        return data.Parameter.Value;
      }
      case 'TWILIO_ACCOUNT_SID': {
        return getParam(context, 'ACCOUNT_SID');
      }
      case 'TWILIO_AUTH_TOKEN': {
        return getParam(context, 'AUTH_TOKEN');
      }
      case 'TWILIO_ENVIRONMENT_SID': {
        const service_sid = await getParam(context, 'TWILIO_SERVICE_SID');
        if (service_sid === null) {
          return null; // service not yet deployed
        }
        const environments = await client.serverless
          .services(service_sid)
          .environments.list();
        return environments[0].sid;
      }
      case 'TWILIO_ENVIRONMENT_DOMAIN_NAME': {
        const service_sid = await getParam(context, 'TWILIO_SERVICE_SID');
        if (service_sid === null) {
          return null; // service not yet deployed
        }
        const environments = await client.serverless
          .services(service_sid)
          .environments.list();
        return environments[0].domainName;
      }
      case 'TWILIO_FLOW_SID': {
        let flow_sid = null;
        await client.studio.flows.list({ limit: 100 }).then((flows) =>
          flows.forEach((f) => {
            if (f.friendlyName === THIS_APPLICATION_NAME) {
              flow_sid = f.sid;
            }
          })
        );
        if (flow_sid !== null) {
          return flow_sid;
        }
        return null;
      }
      case 'TWILIO_SERVICE_SID': {
        let service_sid = null;
        await client.serverless.services.list({ limit: 100 }).then((services) =>
          services.forEach((s) => {
            if (s.friendlyName === THIS_APPLICATION_NAME) {
              service_sid = s.sid;
            }
          })
        );
        if (service_sid !== null) {
          return service_sid;
        }
        console.log(
          'Developer note: YOU MUST DEPLOY THE SERVICE FIRST!!! ABORTING!!!'
        );
        return null;
      }
      default:
        throw new Error(`Undefined variable ${key} !!!`);
    }
  } catch (err) {
    console.log(`Unexpected error in getParam for ${key} ... returning null`);
    return null;
  }
}

/*
 * --------------------------------------------------------------------------------
 * validates appoointment data to guard against json injection
 *
 * param:
 * - appointment: json of appointment data
 *     event_type: 'BOOKED',
 *     event_datetime_utc: null,
 *     patient_id: '1000',
 *     patient_first_name: 'Jane',
 *     patient_last_name: 'Doe',
 *     patient_phone: test_phone_number,
 *     provider_id: 'afauci',
 *     provider_first_name: 'Anthony',
 *     provider_last_name: 'Fauci',
 *     provider_callback_phone: '(800) 111-2222',
 *     appointment_location: 'Owl Health Clinic',
 *     appointment_id: '20000',
 *     appointment_timezone: '-0700',
 *     appointment_datetime: appt_datetime.toISOString(),
 * --------------------------------------------------------------------------------
 */
function validateAppointment(context, appointment) {
  // validates isoDate format ignoring subseconds and timezone
  function validateISO8601Format(name, value) {
    assert(value, `Missing ${name}!`);
    assert(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*/.test(value),
      `${name} not ISO8601 format: ${value}`
    );
    const d = new Date(value.substr(0, 19) + 'Z');
    return d.toISOString().substr(0, 19) === value.substr(0, 19);
  }

  // check for null & validates again format
  function validateFormat(name, value, format) {
    assert(value, `Missing ${name}!`);
    assert(format.test(value), `Invalid ${name}: ${value}!`);
  }

  {
    const v = appointment.event_type;
    assert(v, 'Missing appointment.event_type!');
    const validEventTypes = [
      'BOOKED',
      'MODIFIED',
      'RESCHEDULED',
      'NOSHOWED',
      'CANCEL',
      'CANCELED',
      'CONFIRM',
      'CONFIRMED',
      'REMIND',
      'OPTED-IN',
      'OPTED-OUT',
    ];
    assert(v in validEventTypes, `Invalid event_type=${v}!`);
  }

  validateISO8601Format('event_datetime_utc', appointment.event_datetime_utc);

  validateFormat(
    'patient_id',
    appointment.patient_id,
    /[a-zA-Z0-9 !@#$%^&*()_+\-=\[\]{};:\\|,.<>\/?]+/
  );

  validateFormat(
    'patient_first_name',
    appointment.patient_first_name,
    /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,\.'-]+$/u
  );

  validateFormat(
    'patient_last_name',
    appointment.patient_last_name,
    /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,\.'-]+$/u
  );

  validateFormat('patient_phone', appointment.patient_phone, /[0-9+\-() ]+/);

  validateFormat(
    'provider_id',
    appointment.provider_id,
    /[a-zA-Z0-9 !@#$%^&*()_+\-=\[\]{};:\\|,.<>\/?]+/
  );

  validateFormat(
    'provider_first_name',
    appointment.provider_first_name,
    /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,\.'-]+$/u
  );

  validateFormat(
    'provider_last_name',
    appointment.provider_last_name,
    /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,\.'-]+$/u
  );

  validateFormat(
    'provider_callback_phone',
    appointment.provider_callback_phone,
    /[0-9+\-() ]+/
  );

  validateFormat(
    'appointment_location',
    appointment.appointment_location,
    /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,\.'-]+$/u
  );

  validateFormat(
    'appointment_id',
    appointment.appointment_id,
    /[a-zA-Z0-9 !@#$%^&*()_+\-=\[\]{};:\\|,.<>\/?]+/
  );

  validateFormat(
    'appointment_timezone',
    appointment.appointment_timezone,
    /^[+\-][0-9]{4}$/
  );

  validateISO8601Format(
    'appointment_datetime',
    appointment.appointment_datetime
  );
}

module.exports = {
  getParam,
  setParam,
  validateAppointment,
};
