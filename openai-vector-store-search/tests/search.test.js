/* eslint-disable camelcase */
const mockSearch = jest.fn();

jest.mock('openai', () =>
  jest.fn().mockImplementation(() => ({
    vectorStores: { search: mockSearch },
  }))
);

const OpenAI = require('openai');
const searchFunction = require('../functions/search').handler;
const helpers = require('./test-helper');

const OPENAI_API_KEY = 'sk-test-key';
const VECTOR_STORE_ID = 'vs_abc123';

const context = {
  OPENAI_API_KEY,
};

function buildApiError(status, message) {
  const error = new Error(`${status} ${message}`);
  error.status = status;
  error.error = { message };
  return error;
}

beforeAll(() => {
  helpers.setup({});
});

afterAll(() => {
  helpers.teardown();
});

beforeEach(() => {
  mockSearch.mockReset();
  OpenAI.mockClear();
});

describe('openai-vector-store-search', () => {
  it('returns an error when OPENAI_API_KEY is not configured', (done) => {
    const callback = (err, result) => {
      expect(err).toBeFalsy();
      expect(result._statusCode).toEqual(400);
      expect(result._body).toEqual({
        error: 'Missing OPENAI_API_KEY environment variable.',
      });
      expect(mockSearch).not.toHaveBeenCalled();
      done();
    };

    searchFunction(
      {},
      { query: 'What is the return policy?', vector_store_id: VECTOR_STORE_ID },
      callback
    );
  });

  it('returns an error when query is missing', (done) => {
    const callback = (_err, result) => {
      expect(result._statusCode).toEqual(400);
      expect(result._body).toEqual({
        error: 'Missing parameter; please provide a `query` to search for.',
      });
      expect(mockSearch).not.toHaveBeenCalled();
      done();
    };

    searchFunction(context, { vector_store_id: VECTOR_STORE_ID }, callback);
  });

  it('returns an error when no vector_store_id is provided or configured', (done) => {
    const callback = (_err, result) => {
      expect(result._statusCode).toEqual(400);
      expect(result._body).toEqual({
        error:
          'Missing parameter; please provide a `vector_store_id` or set the OPENAI_VECTOR_STORE_ID environment variable.',
      });
      expect(mockSearch).not.toHaveBeenCalled();
      done();
    };

    searchFunction(context, { query: 'What is the return policy?' }, callback);
  });

  it('returns an error when max_num_results is not a positive integer', (done) => {
    const callback = (_err, result) => {
      expect(result._statusCode).toEqual(400);
      expect(result._body).toEqual({
        error: '`max_num_results` must be a positive integer.',
      });
      expect(mockSearch).not.toHaveBeenCalled();
      done();
    };

    searchFunction(
      context,
      {
        query: 'What is the return policy?',
        vector_store_id: VECTOR_STORE_ID,
        max_num_results: 0,
      },
      callback
    );
  });

  it('returns an error when filters is not an object', (done) => {
    const callback = (_err, result) => {
      expect(result._statusCode).toEqual(400);
      expect(result._body).toEqual({
        error: '`filters` must be an object.',
      });
      expect(mockSearch).not.toHaveBeenCalled();
      done();
    };

    searchFunction(
      context,
      {
        query: 'What is the return policy?',
        vector_store_id: VECTOR_STORE_ID,
        filters: 'not-an-object',
      },
      callback
    );
  });

  it('returns an error when score_threshold is out of range', (done) => {
    const callback = (_err, result) => {
      expect(result._statusCode).toEqual(400);
      expect(result._body).toEqual({
        error: '`score_threshold` must be a number between 0 and 1.',
      });
      expect(mockSearch).not.toHaveBeenCalled();
      done();
    };

    searchFunction(
      context,
      {
        query: 'What is the return policy?',
        vector_store_id: VECTOR_STORE_ID,
        score_threshold: 1.5,
      },
      callback
    );
  });

  it('searches the vector store id from the event', (done) => {
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
    mockSearch.mockResolvedValue({ body: openAiBody, data: openAiBody.data });

    const callback = (err, result) => {
      expect(err).toBeFalsy();
      expect(OpenAI).toHaveBeenCalledWith({ apiKey: OPENAI_API_KEY });
      expect(mockSearch).toHaveBeenCalledWith(VECTOR_STORE_ID, {
        query: 'What is the return policy?',
      });
      expect(result._statusCode).toEqual(200);
      expect(result._body).toEqual(openAiBody);
      done();
    };

    searchFunction(
      context,
      { query: 'What is the return policy?', vector_store_id: VECTOR_STORE_ID },
      callback
    );
  });

  it('falls back to OPENAI_VECTOR_STORE_ID when vector_store_id is not in the event', (done) => {
    const openAiBody = {
      object: 'vector_store.search_results.page',
      search_query: 'hello',
      data: [],
      has_more: false,
      next_page: null,
    };
    mockSearch.mockResolvedValue({ body: openAiBody, data: openAiBody.data });

    const callback = (err, result) => {
      expect(err).toBeFalsy();
      expect(mockSearch).toHaveBeenCalledWith(
        VECTOR_STORE_ID,
        expect.anything()
      );
      expect(result._statusCode).toEqual(200);
      done();
    };

    searchFunction(
      { ...context, OPENAI_VECTOR_STORE_ID: VECTOR_STORE_ID },
      { query: 'hello' },
      callback
    );
  });

  it('trims whitespace from a vector_store_id in the event', (done) => {
    mockSearch.mockResolvedValue({
      body: { object: 'vector_store.search_results.page', data: [] },
      data: [],
    });

    const callback = (err, result) => {
      expect(err).toBeFalsy();
      expect(mockSearch).toHaveBeenCalledWith(
        VECTOR_STORE_ID,
        expect.anything()
      );
      expect(result._statusCode).toEqual(200);
      done();
    };

    searchFunction(
      context,
      { query: 'hello', vector_store_id: ` ${VECTOR_STORE_ID} ` },
      callback
    );
  });

  it('trims whitespace from OPENAI_VECTOR_STORE_ID', (done) => {
    mockSearch.mockResolvedValue({
      body: { object: 'vector_store.search_results.page', data: [] },
      data: [],
    });

    const callback = (err, result) => {
      expect(err).toBeFalsy();
      expect(mockSearch).toHaveBeenCalledWith(
        VECTOR_STORE_ID,
        expect.anything()
      );
      expect(result._statusCode).toEqual(200);
      done();
    };

    searchFunction(
      { ...context, OPENAI_VECTOR_STORE_ID: ` ${VECTOR_STORE_ID} ` },
      { query: 'hello' },
      callback
    );
  });

  it('passes through max_num_results, filters, score_threshold, and rewrite_query', (done) => {
    const openAiBody = {
      object: 'vector_store.search_results.page',
      search_query: 'hello',
      data: [],
      has_more: false,
      next_page: null,
    };
    mockSearch.mockResolvedValue({ body: openAiBody, data: openAiBody.data });

    const callback = (err, result) => {
      expect(err).toBeFalsy();
      expect(mockSearch).toHaveBeenCalledWith(VECTOR_STORE_ID, {
        query: 'hello',
        max_num_results: 5,
        filters: { type: 'eq', key: 'document_type', value: 'pdf' },
        ranking_options: { score_threshold: 0.7 },
        rewrite_query: true,
      });
      expect(result._statusCode).toEqual(200);
      done();
    };

    searchFunction(
      context,
      {
        query: 'hello',
        vector_store_id: VECTOR_STORE_ID,
        max_num_results: 5,
        filters: { type: 'eq', key: 'document_type', value: 'pdf' },
        score_threshold: 0.7,
        rewrite_query: true,
      },
      callback
    );
  });

  it('surfaces an error message returned by the OpenAI API', (done) => {
    mockSearch.mockRejectedValue(
      buildApiError(404, 'No vector store found with id vs_missing.')
    );

    const callback = (err, result) => {
      expect(err).toBeFalsy();
      expect(result._statusCode).toEqual(404);
      expect(result._body).toEqual({
        error: 'No vector store found with id vs_missing.',
      });
      done();
    };

    searchFunction(
      context,
      { query: 'hello', vector_store_id: 'vs_missing' },
      callback
    );
  });
});
