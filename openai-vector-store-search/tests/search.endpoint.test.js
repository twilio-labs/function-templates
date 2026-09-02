/*
 * These tests don't mock the `openai` package itself — they let the real
 * SDK build and send an HTTP request, then intercept that request with
 * `nock` at the network layer. This is a good complement to the
 * module-mocked tests in `search.test.js`: it catches drift between what
 * we *think* the SDK sends (URL, method, headers, body) and what it
 * actually sends.
 */
/* eslint-disable camelcase */
const nock = require('nock');
const searchFunction = require('../functions/search').handler;
const helpers = require('./test-helper');

const OPENAI_API_KEY = 'sk-test-key';
const VECTOR_STORE_ID = 'vs_abc123';
const OPENAI_API_BASE_URL = 'https://api.openai.com';

const context = {
  OPENAI_API_KEY,
};

beforeAll(() => {
  helpers.setup({});
  nock.disableNetConnect();
});

afterAll(() => {
  helpers.teardown();
  nock.enableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
});

describe('openai-vector-store-search (mocked endpoint)', () => {
  it('returns the search results from a successful response', (done) => {
    const openAiBody = {
      object: 'vector_store.search_results.page',
      search_query: 'What is the return policy?',
      data: [
        {
          file_id: 'file_123',
          filename: 'policy.pdf',
          score: 0.95,
          attributes: {},
          content: [{ type: 'text', text: 'Relevant chunk of text.' }],
        },
      ],
      has_more: false,
      next_page: null,
    };

    const scope = nock(OPENAI_API_BASE_URL)
      .matchHeader('authorization', `Bearer ${OPENAI_API_KEY}`)
      .post(`/v1/vector_stores/${VECTOR_STORE_ID}/search`, {
        query: 'What is the return policy?',
      })
      .reply(200, openAiBody);

    const callback = (err, result) => {
      expect(err).toBeFalsy();
      expect(result._statusCode).toEqual(200);
      expect(result._body).toEqual(openAiBody);
      expect(scope.isDone()).toBe(true);
      done();
    };

    searchFunction(
      context,
      {
        query: 'What is the return policy?',
        vector_store_id: VECTOR_STORE_ID,
      },
      callback
    );
  });

  it('surfaces an error response from the endpoint', (done) => {
    const scope = nock(OPENAI_API_BASE_URL)
      .post(`/v1/vector_stores/vs_missing/search`)
      .reply(404, {
        error: { message: 'No vector store found with id vs_missing.' },
      });

    const callback = (err, result) => {
      expect(err).toBeFalsy();
      expect(result._statusCode).toEqual(404);
      expect(result._body).toEqual({
        error: 'No vector store found with id vs_missing.',
      });
      expect(scope.isDone()).toBe(true);
      done();
    };

    searchFunction(
      context,
      { query: 'hello', vector_store_id: 'vs_missing' },
      callback
    );
  });
});
