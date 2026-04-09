/* eslint-disable camelcase, prefer-destructuring */
const {
  GlueClient,
  GetCrawlerCommand,
  StartCrawlerCommand,
  GetTableCommand,
} = require('@aws-sdk/client-glue');

const {
  AthenaClient,
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
} = require('@aws-sdk/client-athena');

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

/*
 * --------------------------------------------------------------------------------
 * synchronously runs glue crawler
 *
 * NOTE: These files are executed on AWS Lambda, updating them here without a redeploy will not change anything.
 * To redeploy run the function /deployment/deploy-aws-code
 *
 * returns response.Crawler if successful; null otherwise
 * --------------------------------------------------------------------------------
 */
async function run_crawler_synchronous(crawler_name, glueClient) {
  try {
    const params = {
      Name: crawler_name,
    };

    // check if crawler is already running
    let response = await glueClient.send(new GetCrawlerCommand(params));
    let crawler_state = response.Crawler.State;

    // start crawler is not running
    if (crawler_state === 'READY') {
      await glueClient.send(new StartCrawlerCommand(params));
      console.log('Started glue crawler:', crawler_name);
    }

    // loop to wait for crawler completion, note that crawler could have been started external from this function
    const sleep_milliseconds = 30000;
    do {
      await new Promise((resolve) => setTimeout(resolve, sleep_milliseconds));
      response = await glueClient.send(new GetCrawlerCommand(params));
      crawler_state = response.Crawler.State;
    } while (crawler_state !== 'READY');

    console.log('Glue crawler state:', crawler_state);

    return response.Crawler;
  } catch (err) {
    console.log(err);
    return null;
  }
}

/*
 * --------------------------------------------------------------------------------
 * synchronously executes athena query
 *
 * returns response.QueryExecution if successful; null otherwise
 * --------------------------------------------------------------------------------
 */
async function execute_query(query, s3bucket, athenaClient) {
  try {
    const output_location = `s3://${s3bucket}/query-results/`;
    const params = {
      QueryString: query,
      ResultConfiguration: {
        EncryptionConfiguration: { EncryptionOption: 'SSE_S3' },
        OutputLocation: output_location,
      },
    };
    let response = await athenaClient.send(
      new StartQueryExecutionCommand(params)
    );
    const qe_id = response.QueryExecutionId;
    console.log('Started athena query...');

    // loop to wait for query completion, note loop will max timeout at lambda max
    const milliseconds = 10000;
    let state = null;
    do {
      await new Promise((resolve) => setTimeout(resolve, milliseconds));
      response = await athenaClient.send(
        new GetQueryExecutionCommand({ QueryExecutionId: qe_id })
      );
      state = response.QueryExecution.Status.State;
    } while (state === 'QUEUED' || state === 'RUNNING');
    console.log('Athena query result :', state);

    return response.QueryExecution;
  } catch (err) {
    console.log(err);
    return null;
  }
}

/*
 * --------------------------------------------------------------------------------
 * synchronously creates downloadable appointment state data
 *
 * - runs for glue crawler
 * - executes athena query
 * - creates signed url for results on s3
 *
 * returns signedURI if successful
 * --------------------------------------------------------------------------------
 */
exports.handler = async function (event, context) {
  try {
    // ---------- environment variables & input event
    const GLUE_CRAWLER = process.env.GLUE_CRAWLER;
    const S3_BUCKET = process.env.S3_BUCKET;

    // ---------- initialize AWS clients
    const glueClient = new GlueClient();
    const athenaClient = new AthenaClient();
    const s3Client = new S3Client();

    // ---------- run glue crawler
    const crawler = await run_crawler_synchronous(GLUE_CRAWLER, glueClient);
    const database_name = crawler.DatabaseName;

    // ---------- check if table data exists
    try {
      const params = {
        DatabaseName: database_name,
        Name: 'state',
      };
      await glueClient.send(new GetTableCommand(params));
    } catch (err) {
      // table does not exist
      return {
        statusCode: 200,
        result: 'NO_HISTORY_TABLE_DATA',
      };
    }

    // ---------- execute athena query
    const query = `select * from ${database_name}.history`;
    const queryExecution = await execute_query(query, S3_BUCKET, athenaClient);

    // ---------- generate s3 signed URL
    console.log(
      'Athena query result s3uri:',
      queryExecution.ResultConfiguration.OutputLocation
    );
    const s3uri = new URL(queryExecution.ResultConfiguration.OutputLocation);
    const signedUrlExpireSeconds = 60 * 60;

    const params = {
      Bucket: s3uri.host,
      Key: s3uri.pathname.substr(1),
    };
    const signedURL = await getSignedUrl(
      s3Client,
      new GetObjectCommand(params),
      {
        expiresIn: signedUrlExpireSeconds,
      }
    );
    console.log('generated signed URL', signedURL);

    return {
      statusCode: 200,
      result: signedURL,
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 400,
      result: err,
    };
  }
};
