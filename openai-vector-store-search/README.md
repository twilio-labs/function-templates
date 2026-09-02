# OpenAI Vector Store Search

Call this Twilio Function to run a semantic search query against an [OpenAI Vector Store](https://platform.openai.com/docs/api-reference/vector-stores) using the [Vector Store search API](https://developers.openai.com/api/docs/guides/tools-file-search). Upload your documents to OpenAI and add them to a vector store ahead of time; this Function then takes a natural-language `query`, has OpenAI embed it and compare it against your stored documents, and returns the closest-matching chunks as JSON — no need to manage the OpenAI request or your API key from your own client or other Twilio Functions.

This is a good fit for building retrieval-augmented generation (RAG) flows, FAQ/knowledge-base search, or "find the relevant document" tools for a Conversation Relay / AI Assistant Function.

## How to use the template

The best way to use the Function templates is through the Twilio CLI as described below. If you'd like to use the template without the Twilio CLI, [check out our usage docs](../docs/USING_FUNCTIONS.md).

### Pre-requisites

You'll need an existing [OpenAI Vector Store](https://platform.openai.com/storage/vector_stores) with files already added to it. You can create one and upload files to it from the [OpenAI dashboard](https://platform.openai.com/storage/vector_stores) or via the [Files](https://platform.openai.com/docs/api-reference/files) and [Vector Stores](https://platform.openai.com/docs/api-reference/vector-stores) APIs.

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable                  | Description                                                                                                    | Required |
| :------------------------ | :-------------------------------------------------------------------------------------------------------------- | :------- |
| `OPENAI_API_KEY`          | Your OpenAI API key. Create one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)         | Yes      |
| `OPENAI_VECTOR_STORE_ID`  | The default vector store to search (e.g. `vs_abc123`), used when a request doesn't provide its own `vector_store_id` | No       |

### Function Parameters

`/search` expects a `POST` with a JSON body containing the following parameters:

| Parameter          | Description                                                                                                    | Required |
| :----------------- | :---------------------------------------------------------------------------------------------------------------- | :------- |
| `query`            | The natural-language search query                                                                                | Yes      |
| `vector_store_id`  | The id of the vector store to search. Not required if `OPENAI_VECTOR_STORE_ID` is set                            | No       |
| `max_num_results`  | The maximum number of results to return                                                                          | No       |
| `filters`          | An [attribute filter](https://developers.openai.com/api/docs/guides/tools-file-search#attribute-filtering) object to narrow the search | No       |
| `score_threshold`  | Minimum relevance score (`0`-`1`) a result must have to be returned                                              | No       |
| `rewrite_query`    | Whether OpenAI should rewrite your query to improve search results (`true`/`false`)                              | No       |

The response body is the raw JSON response from the OpenAI Vector Store search API — an object with `data` (an array of `{ file_id, filename, score, attributes, content }` results) and pagination info (`has_more`, `next_page`).

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=openai-vector-store-search && cd example
```

4. Add your environment variables to `.env`:

Make sure variables are populated in your `.env` file. See [Environment variables](#environment-variables).

5. Start the server:

```
twilio serverless:start
```

6. Open the web page at https://localhost:3000/index.html to try the demo form, or send a request directly:

```shell
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the return policy?", "vector_store_id": "vs_abc123"}'
```

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```

### Verifying a deployment

Once deployed, `npm run smoke-test` sends a real request to the live `/search` Function so you can confirm the deployment actually works end-to-end (not just against local mocks):

```shell
FNA_SERVERLESS_EMBEDDINGS_ENDPOINT=https://my-app-1234.twil.io/search npm run smoke-test
```

It exits non-zero if the request fails, if the endpoint returns a non-2xx status, or if the response doesn't look like a vector store search result — so it's safe to use as a post-deploy check in a script or CI job. Optional overrides:

| Variable                     | Description                                                                                      |
| :---------------------------- | :------------------------------------------------------------------------------------------------ |
| `SMOKE_TEST_QUERY`            | The search query to send. Defaults to `"What is the return policy?"`                             |
| `SMOKE_TEST_VECTOR_STORE_ID`  | `vector_store_id` to send, if the deployed Function doesn't already default to one via its own `OPENAI_VECTOR_STORE_ID` |
