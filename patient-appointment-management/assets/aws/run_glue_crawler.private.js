/* eslint-disable camelcase */
const THIS = 'run-glue-crawler:';
/*
 * --------------------------------------------------------------------------------
 * runs glue crawler synchronously, to be invoked via a schedule
 *
 * - retrieves last modified date of 'outreach' s3 prefixes
 * - runs the glue crawler only if crawler is out-of-date
 *
 * returns
 * - statusCode='RUNNING', if glue crawler is up-to-date
 * --------------------------------------------------------------------------------
 */
const assert = require('assert');
const AWS = require('aws-sdk');

const { path } = Runtime.getFunctions().helpers;
const { retrieveParameter, assignParameter } = require(path);

/*
 * --------------------------------------------------------------------------------
 * returns
 * - 'READY' if crawler is up-to-date
 * - 'RUNNING' if crawler is started, running, or stopping
 * --------------------------------------------------------------------------------
 */
async function orchestrateGlueCrawler(s3, glue) {
  // ----------
  async function _getLastModifiedDate(params) {
    let lastModifiedDate = null; // returned if no s3 objects are found
    const response = await s3.listObjectsV2(params).promise();
    response.Contents.forEach(function (obj) {
      if (lastModifiedDate === null) {
        lastModifiedDate = obj.LastModified;
      } else if (lastModifiedDate < obj.LastModified) {
        lastModifiedDate = obj.LastModified;
      }
    });

    if (response.NextContinuationToken) {
      params.ContinuationToken = response.NextContinuationToken;
      const _lastModifiedDate = await _getLastModifiedDate(params, s3); // recursive synchronous call
      if (_lastModifiedDate > lastModifiedDate)
        lastModifiedDate = _lastModifiedDate;
    }
    return lastModifiedDate;
  }
  // ----------

  // check crawler status
  let database_name = null;
  {
    const params = {
      Name: AWS_GLUE_CRAWLER,
    };
    const response = glue.getCrawler(params).promise();
    database_name = response.Crawler.DatabaseName;
    console.log(THIS, 'Crawler.State =', response.Crawler.State);
    switch (response.Crawler.State) {
      case 'RUNNING':
        return 'RUNNING';
        break;
      case 'STOPPING':
        return 'RUNNING';
        break;
      case 'READY':
        break;
    }
  }

  // check 'history' table for last update
  let table_last_updated = null;
  try {
    const params = {
      DatabaseName: database_name,
      Name: 'history',
    };
    const response = await glue.getTable(params).promise();
    table_last_updated = response.Table.UpdateTime;
    console.log(THIS, 'Table Last Updated =', table_last_updated);
  } catch (EntityNotFoundException) {
    // table not crawled yet, so start crawler
  }

  // determine if crawlers needs to be run
  if (table_last_updated != null) {
    // find last update in s3 for history objects
    const params = {
      Bucket: AWS_S3_BUCKET,
      Prefix: 'history/',
    };
    const s3_last_updated = await _getLastModifiedDate(params, s3);
    console.log(THIS, 'S3 Last Updated =', s3_last_updated);
    if (table_last_updated > s3_last_updated) {
      console.log(THIS, 'No need to crawl');
      return 'READY';
    }
  }

  // start crawler asynchronously
  const params = {
    Name: AWS_GLUE_CRAWLER,
  };
  await glue.startCrawler(params).promise();
  console.log(THIS, 'Started crawler :', AWS_GLUE_CRAWLER);
  return 'RUNNING';
}

/*
 * --------------------------------------------------------------------------------
 * Note that exports.handler is changed to 'async' allow use of 'await' to serialize execution.
 * Therefore, all asnychronous s3 functions must be called in this function body.
 * --------------------------------------------------------------------------------
 */
exports.handler = async function (context, event) {
  console.log(THIS, 'Begin');
  console.time(THIS);

  // ---------- validate enviroment variables & input event
  assert(
    process.env.AWS_ACCESS_KEY_ID,
    'missing process.env.AWS_ACCESS_KEY_ID'
  );
  assert(
    process.env.AWS_SECRET_ACCESS_KEY,
    'missing process.env.AWS_SECRET_ACCESS_KEY'
  );
  assert(process.env.AWS_REGION, 'missing process.env.AWS_REGION');
  assert(process.env.AWS_S3_BUCKET, 'missing process.env.AWS_S3_BUCKET');
  assert(process.env.AWS_GLUE_CRAWLER, 'missing process.env.AWS_GLUE_CRAWLER');
  assert(
    process.env.AWS_GLUE_DATABASE,
    'missing process.env.AWS_GLUE_DATABASE'
  );

  try {
    // initialize aws clients
    const s3 = new aws.S3();
    const glue = new aws.Glue();
    const athena = new aws.Athena();

    // ----------
    switch (await orchestrateGlueCrawler(s3, glue)) {
      case 'RUNNING':
        return 'RUNNING';
        break;
      case 'READY':
        break;
    }

    // ----------
    const response = glue.getCrawler({ Name: AWS_GLUE_CRAWLER }).promise();
    const DATABASE_NAME = response.Crawler.DatabaseName;
    let TABLE_NAME = null;
    if (event.hasOwnProperty('table')) {
      TABLE_NAME = event.table;
    } else {
      throw new Error('missing table parameter!!!');
    }

    const query = `select * from ${AWS_GLUE_DATABASE}.${TABLE_NAME}`;
    const query_result = await executeAthenaQuery(query, s3, athena);
    if (query_result == 'RUNNING') return 'RUNNING';

    console.log(THIS, 'query result s3 uri :', query_result);

    // generate s3 presigned URL
    s3uri = new URL(query_result);
    const signedUrlExpireSeconds = 60 * 60;

    const params = {
      Bucket: s3uri.host,
      Key: s3uri.pathname.substr(1),
      Expires: signedUrlExpireSeconds,
    };
    const signedURL = s3.getSignedUrl('getObject', params);
    console.log(THIS, 'generated signed URL');

    return callback(null, signedURL);
  } finally {
    console.timeEnd(THIS);
  }
};

exports.handler({}, {});
