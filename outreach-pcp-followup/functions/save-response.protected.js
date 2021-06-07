const THIS = 'save-response:';
// --------------------------------------------------------------------------------
// saves a patient response to s3
//
// event.patient     : flow.data that will be parenthesis enclosed comma-separated
//                     key=value string. Note that values will not be enclosed in quotes.
//                     (eg., {k1=v1, k2=v2, k3=v3} )
// event.question_id : short alphanumeric ID for question
// event.response    : response text to question
// event.question    : optional, full question text
//
// returns : event.response as pass-through
// --------------------------------------------------------------------------------
exports.handler = async function(context, event, callback) {
    console.log(THIS, 'Started');
    console.time(THIS);
    try {
        const assert = require('assert');
        const AWS = require('aws-sdk');
        const path = Runtime.getFunctions()['helpers'].path;
        const {retrieveParameter, assignParameter} = require(path);

        // ---------- validate environment variables & input event
        const AWS_ACCESS_KEY_ID     = await retrieveParameter(context, 'AWS_ACCESS_KEY_ID');
        const AWS_SECRET_ACCESS_KEY = await retrieveParameter(context, 'AWS_SECRET_ACCESS_KEY');
        const AWS_REGION            = await retrieveParameter(context, 'AWS_REGION');
        const AWS_S3_BUCKET         = await retrieveParameter(context, 'AWS_S3_BUCKET');
        assert(event.hasOwnProperty('patient'), 'missing input event.patient');
        assert(event.hasOwnProperty('question_id'), 'missing input event.question_id');
        assert(event.hasOwnProperty('response'), 'missing input event.response');

        // convert patient string to json
        console.log('patient=', event.patient);
        let patient = {};
        const kv_array = event.patient.replace('{', '').replace('}', '').split(',');
        kv_array.forEach(function (a) {
            kv = a.split('=');
            patient[kv[0].trim()] = kv[1].trim();
        });
        assert(patient.hasOwnProperty('outreach_id'), 'missing event.patient.outreach_id');
        assert(patient.hasOwnProperty('patient_id'), 'missing event.patient.patient_id');

        // initialize s3 client
        const s3 = new AWS.S3({
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
            region: AWS_REGION
        });

        const response_utc = new Date()
        patient.response_utc = response_utc.toISOString();
        patient.question_id = event.question_id;
        patient.response = event.response;
        if (event.hasOwnProperty('question')) patient.question = event.question;

        // initialize constants
        const response_file_s3key = [
            'responses',
            'outreach=' + patient.outreach_id,
            'response-patient' + patient.patient_id + '-' + response_utc.getTime() + '.json'
        ].join('/');

        const params = {
            Bucket: AWS_S3_BUCKET,
            Key: response_file_s3key,
            Body: JSON.stringify(patient),
            ServerSideEncryption: 'AES256'
        };
        let results = await s3.putObject(params).promise();
        console.log('PUT - ', params.Key);

        callback(null, { 'code': 200 });

    } catch (err) {
      if (err.code === 'ERR_ASSERTION') callback(err.code, { 'code': 400 });
      else callback(err.code);
    } finally {
      console.timeEnd(THIS);
    }
};
