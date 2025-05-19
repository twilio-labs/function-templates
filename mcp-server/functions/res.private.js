const { Writable } = require('stream');

/**
 * Create a response object to use as mock express
 * @param {*} callback
 * @returns
 */
module.exports = function createRes(callback) {
  let responseData = '';
  let statusCode = 200;
  const responseHeaders = {};
  const stream = new Writable({
    write(chunk, encoding, cb) {
      responseData += chunk.toString();
      cb();
    },
    final(cb) {
      cb();
    },
  });

  const res = {
    statusCode: 200,
    write: (chunk) => {
      return stream.write(chunk);
    },
    end: (chunk) => {
      if (chunk) {
        stream.write(chunk);
      }
      stream.end();

      const response = new Twilio.Response();
      response.setStatusCode(statusCode);
      response.setBody(responseData);
      response.setHeaders(responseHeaders);

      callback(null, response);
    },
    writeHead: (code, headers) => {
      statusCode = code;
      if (headers) {
        Object.assign(responseHeaders, headers);
      }
      return res;
    },
    setHeader: (name, value) => {
      responseHeaders[name] = value;
      return res;
    },
    flushHeaders: () => {
      return res;
    },
    on: stream.on.bind(stream),
    once: stream.once.bind(stream),
    emit: stream.emit.bind(stream),
  };

  return res;
};
