/* eslint-disable camelcase, prefer-destructuring, dot-notation */
const THIS = 'execute-query:';
/*
 * --------------------------------------------------------------------------------
 * executes query
 *
 * returns
 * - STARTED, if started successfully
 * - RUNNING, if already running
 * --------------------------------------------------------------------------------
 */
const assert = require('assert');
const AWS = require('aws-sdk');

const path0 = Runtime.getFunctions()['helpers'].path;
const { getParam, setParam } = require(path0);
const path1 = Runtime.getFunctions()['auth'].path;
const { isValidAppToken } = require(path1);

// --------------------------------------------------------------------------------
exports.handler = async function (context, event, callback) {
  console.log(THIS, 'Begin');
  console.time(THIS);
  try {
    assert(event.token, 'missing event.token');
    if (!isValidAppToken(event.token, context)) {
      const response = new Twilio.Response();
      response.setStatusCode(401);
      response.appendHeader('Content-Type', 'application/json');
      response.setBody({ message: 'Unauthorized' });

      return callback(null, response);
    }

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

    // check existence
    let params = {
      stateMachineArn: stm_arn,
    };
    response = await sfn.describeStateMachine(params).promise();

    // check for execution
    params = {
      stateMachineArn: stm_arn,
      statusFilter: 'RUNNING',
      maxResults: 1,
    };
    response = await sfn.listExecutions(params).promise();
    if (response.executions.length > 0) {
      return callback(null, 'RUNNING');
    }

    params = {
      stateMachineArn: stm_arn,
      input: '{}',
    };
    response = await sfn.startExecution(params).promise();

    return callback(null, 'STARTED');
  } catch (err) {
    console.log(err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
};
