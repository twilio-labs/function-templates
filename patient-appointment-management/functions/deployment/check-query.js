/* eslint-disable camelcase */
/* eslint-disable prefer-destructuring */
/* eslint-disable dot-notation */
/* eslint-disable prefer-template */
const THIS = 'check-query:';
/*
 * --------------------------------------------------------------------------------
 * check query
 *
 * returns
 *  - RUNNING, if data is being prepared
 *  - READY, if ready to prepare data
 *  - a signedURL, if data is available for download
 * --------------------------------------------------------------------------------
 */
const assert = require('assert');
const AWS = require('aws-sdk');

const path = Runtime.getFunctions()['helpers'].path;
const { getParam, setParam } = require(path);

// --------------------------------------------------------------------------------
exports.handler = async function (context, event, callback) {
  console.log(THIS, 'Begin');
  console.time(THIS);
  try {
    const AWS_ACCESS_KEY_ID = await getParam(context, 'AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = await getParam(
      context,
      'AWS_SECRET_ACCESS_KEY'
    );
    const AWS_REGION = await getParam(context, 'AWS_REGION');
    assert(event.table, 'missing event.table');
    const TABLE = event.table;
    const SFN_QUERY =
      TABLE === 'state'
        ? await getParam(context, 'AWS_SFN_QUERY_STATE')
        : await getParam(context, 'AWS_SFN_QUERY_HISTORY');

    // ---------- get aws clients
    const options = {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION,
    };
    const sts = new AWS.STS(options);
    const sfn = new AWS.StepFunctions(options);

    // ----------
    let response = await sts.getCallerIdentity().promise();
    const account_id = response.Account.toString();
    const stm_arn = [
      'arn:aws:states',
      AWS_REGION,
      account_id,
      'stateMachine',
      SFN_QUERY,
    ].join(':');
    console.log(THIS, stm_arn);

    // check existence
    let params = {
      stateMachineArn: stm_arn,
    };
    response = await sfn.describeStateMachine(params).promise();

    // get last (most recent) execution
    params = {
      stateMachineArn: stm_arn,
      maxResults: 1,
    };
    response = await sfn.listExecutions(params).promise();
    if (response.executions.length === 0) {
      // never executed yet
      console.log(THIS, 'Returning READY - never executed');
      return callback(null, 'READY');
    }

    console.log(THIS, 'Execution.Status=', response.executions[0].status);
    switch (response.executions[0].status) {
      case 'RUNNING':
        // there's running execution
        console.log(THIS, 'Returning RUNNING');
        return callback(null, 'RUNNING');
        break;
      case 'SUCCEEDED':
        // check if ran within last 1 hour (in sync with expiration of s3 signedURL)
        if (
          Date.now() - response.executions[0].startDate >
          24 * 60 * 60 * 1000
        ) {
          // last execution is over 1 hour ago
          console.log(THIS, 'Returning READY');
          return callback(null, 'READY');
        }
        // get signed URL from last execution output
        params = {
          executionArn: response.executions[0].executionArn,
        };
        response = await sfn.describeExecution(params).promise();
        console.log('output', response.output);
        const output = JSON.parse(response.output);
        signed_url = output.result;

        console.log(THIS, 'Returning signedURL');
        return callback(null, signed_url);
        break;
      default:
        throw new Error(
          'last execution status=' + response.executions[0].status
        );
        break;
    }
  } catch (err) {
    console.log(err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
};
