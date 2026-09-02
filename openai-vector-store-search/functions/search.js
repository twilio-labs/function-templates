const OpenAI = require('openai');

function trimIfString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function getVectorStoreId(context, event) {
  const vectorStoreId =
    trimIfString(event.vector_store_id) || // eslint-disable-line camelcase
    trimIfString(context.OPENAI_VECTOR_STORE_ID);

  console.log('using vectorStoreId: [${vectorStoreId}]');

  if (!vectorStoreId) {
    throw new Error(
      'Missing parameter; please provide a `vector_store_id` or set the OPENAI_VECTOR_STORE_ID environment variable.'
    );
  }

  return vectorStoreId;
}

function addMaxNumResults(searchParams, maxNumResults) {
  if (typeof maxNumResults === 'undefined') {
    return;
  }

  const parsedMaxNumResults = Number(maxNumResults);
  if (!Number.isInteger(parsedMaxNumResults) || parsedMaxNumResults <= 0) {
    throw new Error('`max_num_results` must be a positive integer.');
  }
  searchParams.max_num_results = parsedMaxNumResults; // eslint-disable-line camelcase
}

function addFilters(searchParams, filters) {
  if (typeof filters === 'undefined') {
    return;
  }

  if (typeof filters !== 'object' || filters === null) {
    throw new Error('`filters` must be an object.');
  }
  searchParams.filters = filters;
}

function addScoreThreshold(searchParams, scoreThreshold) {
  if (typeof scoreThreshold === 'undefined') {
    return;
  }

  const parsedScoreThreshold = Number(scoreThreshold);
  if (
    Number.isNaN(parsedScoreThreshold) ||
    parsedScoreThreshold < 0 ||
    parsedScoreThreshold > 1
  ) {
    throw new Error('`score_threshold` must be a number between 0 and 1.');
  }
  searchParams.ranking_options = { score_threshold: parsedScoreThreshold }; // eslint-disable-line camelcase
}

function addRewriteQuery(searchParams, rewriteQuery) {
  if (typeof rewriteQuery === 'undefined') {
    return;
  }

  searchParams.rewrite_query = rewriteQuery === true || rewriteQuery === 'true'; // eslint-disable-line camelcase
}

function buildSearchParams(event) {
  const { query } = event;

  if (typeof query !== 'string' || query.length === 0) {
    throw new Error(
      'Missing parameter; please provide a `query` to search for.'
    );
  }

  const searchParams = { query };
  addMaxNumResults(searchParams, event.max_num_results); // eslint-disable-line camelcase
  addFilters(searchParams, event.filters);
  addScoreThreshold(searchParams, event.score_threshold); // eslint-disable-line camelcase
  addRewriteQuery(searchParams, event.rewrite_query); // eslint-disable-line camelcase

  return searchParams;
}

/**
 * OpenAI Vector Store Search
 *
 * Forwards the incoming request to OpenAI's Vector Store search API (via the
 * official `openai` Node SDK) and returns the matching results as JSON.
 * Under the hood OpenAI embeds your `query`, compares it against the
 * embeddings it already generated for the files in your vector store, and
 * returns the closest-matching chunks. This lets you run semantic search
 * over documents you've uploaded to OpenAI (e.g. via the Files and Vector
 * Stores APIs) from Studio, another Function, or any webhook Twilio can
 * reach, without your `OPENAI_API_KEY` ever leaving the Twilio Runtime.
 *
 * Parameters:
 * "query"            - string  - required - the natural-language search query
 * "vector_store_id"  - string  - required unless OPENAI_VECTOR_STORE_ID is set -
 *                       the id of the vector store to search (e.g. "vs_abc123")
 * "max_num_results"  - number  - optional - maximum number of results to return
 * "filters"          - object  - optional - attribute filter to apply to the search,
 *                       see https://developers.openai.com/api/docs/guides/tools-file-search
 * "score_threshold"  - number  - optional - minimum relevance score (0-1) a result must have
 * "rewrite_query"     - boolean - optional - whether OpenAI should rewrite the query for search
 *
 * See https://platform.openai.com/docs/api-reference/vector-stores for details on the underlying API.
 */
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  try {
    if (!context.OPENAI_API_KEY) {
      throw new Error('Missing OPENAI_API_KEY environment variable.');
    }

    const searchParams = buildSearchParams(event);
    const vectorStoreId = getVectorStoreId(context, event);

    const client = new OpenAI({ apiKey: context.OPENAI_API_KEY });
    const page = await client.vectorStores.search(vectorStoreId, searchParams);

    response.setStatusCode(200);
    response.setBody(page.body);
    return callback(null, response);
  } catch (error) {
    const message = error.error?.message || error.message;
    console.error(message);
    response.setStatusCode(error.status || 400);
    response.setBody({ error: message });
    return callback(null, response);
  }
};
