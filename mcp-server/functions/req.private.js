const { Readable } = require('stream');
const { EventEmitter } = require('events');

class BodyStream extends Readable {
  constructor(data) {
    super();
    this._data = data;
    this._sent = false;
  }

  _read() {
    if (!this._sent) {
      this.emit('data', Buffer.from(this._data));
      this.push(this._data);
      this.push(null);
      this._sent = true;
    }
  }
}

/**
 * Create a request object to use as mock express
 * @param {*} event
 * @param {*} body
 * @returns
 */
module.exports = function createReq(event, body) {
  if (event.method === 'initialize' && !body) {
    event.params = {
      protocolVersion: '2024-11-05',
      capabilities: { sampling: {}, roots: { listChanged: true } },
      clientInfo: { name: 'internal-initialization', version: '0.1.0' },
    };
  }

  if (!body) {
    body = { ...event };
    delete body.request;
  }
  const bodyStream = new BodyStream(JSON.stringify(body));

  const req = Object.assign(new EventEmitter(), {
    method: event.method || 'GET',
    url: event.url || '/',
    headers: {
      ...event.request.headers,
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json',
    },
    readable: true,
    pipe: bodyStream.pipe.bind(bodyStream),
    on: bodyStream.on.bind(bodyStream),
    once: bodyStream.once.bind(bodyStream),
    emit: bodyStream.emit.bind(bodyStream),
    removeListener: bodyStream.removeListener.bind(bodyStream),
    read: bodyStream.read.bind(bodyStream),
    _readableState: bodyStream._readableState,
  });

  req.constructor = Readable;
  bodyStream._read();

  if (event.method) {
    req.method = 'POST';
  }

  return req;
};
