/* eslint-disable no-nested-ternary */

const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { formatDocumentsAsString } = require('langchain/util/document');
const {
  RunnableSequence,
  RunnablePassthrough,
} = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { default: Exa } = require('exa-js');

const PROMPT = `
You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use a 8 sentences maximum and keep the answer concise.

Question: {question} 

Context: {context} 

Answer:
`.trim();

/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {{}} event
 * @param {import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback} callback
 */
exports.handler = async function (context, event, callback) {
  if (!context.EXA_API_KEY) {
    return callback(new Error('Invalid configuration'));
  }

  if (!event.query) {
    return callback(new Error('Missing query'));
  }

  const exa = new Exa(context.EXA_API_KEY);

  const domains = Array.isArray(event.limitToDomains)
    ? event.limitToDomains
    : event.limitToDomains
      ? [event.limitToDomains]
      : undefined;
  const numResults = event.n ? parseInt(event.n, 10) : 5;
  const searchAndTextResults = await exa.searchAndContents(event.query, {
    numResults,
    text: {
      maxCharacters: 1000,
    },
    highlights: {
      highlightsPerUrl: 1,
      numSentences: 7,
    },
    useAutoprompt: true,
    includeDomains: domains,
  });

  if (!event.summarize) {
    return callback(null, searchAndTextResults.results);
  }

  if (!context.OPENAI_API_KEY) {
    console.error('No OpenAI key, skipping summarization');
    return callback(null, searchAndTextResults.results);
  }

  const data = searchAndTextResults.results.flatMap(
    (result) => result.highlights
  );

  const prompt = ChatPromptTemplate.fromMessages([['human', PROMPT]]);
  const llm = new ChatOpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0 });

  const ragChain = RunnableSequence.from([
    {
      context: () => data.join('\n\n'),
      question: new RunnablePassthrough(),
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  const result = await ragChain.invoke(event.query);
  return callback(null, result);
};
