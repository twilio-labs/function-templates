#!/usr/bin/env node

/*
 * Hits the actual deployed `/search` Function so you can confirm a
 * deployment works end-to-end, rather than only against local mocks.
 *
 * Usage:
 *   FNA_SERVERLESS_EMBEDDINGS_ENDPOINT=https://my-app-1234.twil.io/search npm run smoke-test
 *
 * Optional overrides:
 *   SMOKE_TEST_QUERY            - the search query to send (default below)
 *   SMOKE_TEST_VECTOR_STORE_ID  - vector_store_id to send, if the deployed
 *                                 Function doesn't already default to one
 *                                 via its own OPENAI_VECTOR_STORE_ID
 */

const DEFAULT_QUERY = 'What is the return policy?';

class SmokeTestError extends Error {}

function getEndpointUrl() {
  const endpoint = process.env.FNA_SERVERLESS_EMBEDDINGS_ENDPOINT;

  if (!endpoint) {
    throw new SmokeTestError(
      'FNA_SERVERLESS_EMBEDDINGS_ENDPOINT is not set. Set it to the deployed ' +
        'Function URL, e.g.\n' +
        '  FNA_SERVERLESS_EMBEDDINGS_ENDPOINT=https://my-app-1234.twil.io/search npm run smoke-test'
    );
  }

  try {
    return new URL(endpoint);
  } catch (error) {
    throw new SmokeTestError(
      `FNA_SERVERLESS_EMBEDDINGS_ENDPOINT is not a valid URL: "${endpoint}"`
    );
  }
}

function buildRequestBody() {
  const body = { query: process.env.SMOKE_TEST_QUERY || DEFAULT_QUERY };

  if (process.env.SMOKE_TEST_VECTOR_STORE_ID) {
    body.vector_store_id = process.env.SMOKE_TEST_VECTOR_STORE_ID; // eslint-disable-line camelcase
  }

  return body;
}

async function callEndpoint(url, body) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new SmokeTestError(`Request to ${url} failed: ${error.message}`);
  }

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch (error) {
    throw new SmokeTestError(
      `Response from ${url} was not valid JSON: ${text.slice(0, 500)}`
    );
  }

  return { response, data };
}

function assertSuccessfulSearch(response, data) {
  if (!response.ok) {
    const message = (data && data.error) || JSON.stringify(data);
    throw new SmokeTestError(
      `Endpoint returned ${response.status}: ${message}`
    );
  }

  if (!data || !Array.isArray(data.data)) {
    throw new SmokeTestError(
      `Response body did not contain the expected \`data\` array: ${JSON.stringify(
        data
      )}`
    );
  }
}

async function main() {
  const url = getEndpointUrl();
  const body = buildRequestBody();

  console.log(`POST ${url.toString()}`);
  console.log(`Request body: ${JSON.stringify(body)}`);

  const { response, data } = await callEndpoint(url, body);

  console.log(`Status: ${response.status}`);
  console.log('Response body:');
  console.log(JSON.stringify(data, null, 2));

  assertSuccessfulSearch(response, data);

  console.log(
    `\n✔ Smoke test passed — endpoint returned ${data.data.length} result(s).`
  );
}

main().catch((error) => {
  console.error(`\n✖ Smoke test failed: ${error.message}`);
  process.exit(1); // eslint-disable-line no-process-exit
});
