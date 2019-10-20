const holdMusicHandler = require('../functions/hold-music').handler;
const helpers = require('../../test/test-helper');
const fetch = require('node-fetch');

jest.mock('node-fetch', () => jest.fn());

const FetchResponse = jest.requireActual('node-fetch').Response;
const FetchError = jest.requireActual('node-fetch').FetchError;

const mockMath = Object.create(global.Math);
mockMath.random = jest.fn().mockReturnValue(0.5);
global.Math = mockMath;

function callbackHelper(done, callback) {
  let callCount = 0;

  return function(err, result) {
    callCount += 1;

    try {
      expect(callCount).toEqual(1);

      callback(err, result);
      done();
    } catch(e) {
      done(e);
    }
  }
}

beforeAll(() => {
  helpers.setup({});
});

afterAll(() => {
  helpers.teardown();
});

beforeEach(() => fetch.mockReset());


// HOLD-MUSIC-1
describe('a missing S3 Bucket parameter', () => {
  it('says that the bucket is required when missing', done => {
    const callback = (err, result) => {
      expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
      expect(result.toString()).toMatch(
        '<Response><Say>An S 3 bucket is required.</Say></Response>'
      );
      done();
    };

    holdMusicHandler({}, {}, callback);
  });

  it('says that the bucket is required when null', done => {
    const callback = (err, result) => {
      expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
      expect(result.toString()).toMatch(
          '<Response><Say>An S 3 bucket is required.</Say></Response>'
      );
      done();
    };

    holdMusicHandler({BUCKET: null}, {}, callback);
  });

  it('says that the bucket is required when empty', done => {
    const callback = (err, result) => {
      expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
      expect(result.toString()).toMatch(
          '<Response><Say>An S 3 bucket is required.</Say></Response>'
      );
      done();
    };

    holdMusicHandler({BUCKET: ''}, {}, callback);
  });
});


// Test Case HOLD-MUSIC-2
describe('a failed S3 bucket download', () => {
  it('handles bucket timeout', done => {
    fetch.mockReturnValue(
        Promise.reject(new FetchError('network timeout at: http://mock.url/', 'request-timeout'))
    );

    const callback = callbackHelper(done, (err, result) => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('http://example.s3.amazonaws.com/', {timeout: 5000});

      expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
      expect(result.toString()).toMatch(
          '<Response><Say>Failed to fetch the hold music.</Say></Response>'
      );
    });

    holdMusicHandler({BUCKET: 'example'}, {}, callback);
  });

  it('handles bucket not found', done => {
    fetch.mockReturnValue(
        Promise.resolve(new FetchResponse(
            '<Error>' +
            '<Code>NoSuchBucket</Code>' +
            '<Message>The specified bucket does not exist</Message>' +
            '<BucketName>example</BucketName>' +
            '</Error>',
            {status: 404}
        ))
    );

    const callback = callbackHelper(done, (err, result) => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('http://example.s3.amazonaws.com/', {timeout: 5000});

      expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
      expect(result.toString()).toMatch(
          '<Response><Say>Failed to fetch the hold music.</Say></Response>'
      );
    });

    holdMusicHandler({BUCKET: 'example'}, {}, callback);
  });
});


// Test Case HOLD-MUSIC-3
describe('download successful but no available songs', () => {
  it('handles bucket empty', done => {
    fetch.mockReturnValue(Promise.resolve(new FetchResponse('<ListBucketResult><Prefix/></ListBucketResult>')));

    const callback = callbackHelper(done, (err, result) => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('http://example.s3.amazonaws.com/', {timeout: 5000});

      expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
      expect(result.toString()).toMatch(
          '<Response><Say>Failed to fetch the hold music.</Say></Response>'
      );
    });

    holdMusicHandler({BUCKET: 'example'}, {}, callback);
  });

  it('handles bucket without music', done => {
    fetch.mockReturnValue(Promise.resolve(new FetchResponse('<ListBucketResult><Prefix/><Contents><Key>license.txt</Key></Contents></ListBucketResult>')));

    const callback = callbackHelper(done, (err, result) => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('http://example.s3.amazonaws.com/', {timeout: 5000});

      expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
      expect(result.toString()).toMatch(
          '<Response><Say>Failed to fetch the hold music.</Say></Response>'
      );
    });

    holdMusicHandler({BUCKET: 'example'}, {}, callback);
  });
});


// Test Case HOLD-MUSIC-4
describe('fetching songs without a message', () => {
  it('fetches items from the bucket and shuffles', done => {
    fetch.mockReturnValue(Promise.resolve(
        new FetchResponse(
            '<ListBucketResult><Prefix/>' +
            '<Contents><Key>foo.mp3</Key></Contents>' +
            '<Contents><Key>bar.mp3</Key></Contents>' +
            '<Contents><Key>baz.mp3</Key></Contents>' +
            '</ListBucketResult>'
        )
    ));

    const callback = callbackHelper(done, (err, result) => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('http://example.s3.amazonaws.com/', {timeout: 5000});

      expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
      expect(result.toString()).toMatch(
          '<Response>' +
          '<Play>http://example.s3.amazonaws.com/foo.mp3</Play>' +
          '<Play>http://example.s3.amazonaws.com/baz.mp3</Play>' +
          '<Play>http://example.s3.amazonaws.com/bar.mp3</Play>' +
          '<Redirect/>' +
          '</Response>'
      );

    });

    holdMusicHandler({BUCKET: 'example'}, {}, callback);
  });

  it('fetches items from the bucket and shuffles with a different seed', done => {
    fetch.mockReturnValue(Promise.resolve(
        new FetchResponse(
            '<ListBucketResult><Prefix/>' +
            '<Contents><Key>foo.mp3</Key></Contents>' +
            '<Contents><Key>bar.mp3</Key></Contents>' +
            '<Contents><Key>baz.mp3</Key></Contents>' +
            '</ListBucketResult>'
        )
    ));

    mockMath.random.mockReturnValueOnce(0.1);

    const callback = callbackHelper(done, (err, result) => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('http://example.s3.amazonaws.com/', {timeout: 5000});

      expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
      expect(result.toString()).toMatch(
          '<Response>' +
          '<Play>http://example.s3.amazonaws.com/baz.mp3</Play>' +
          '<Play>http://example.s3.amazonaws.com/bar.mp3</Play>' +
          '<Play>http://example.s3.amazonaws.com/foo.mp3</Play>' +
          '<Redirect/>' +
          '</Response>'
      );

    });

    holdMusicHandler({BUCKET: 'example'}, {}, callback);
  });
});


// Test Case HOLD-MUSIC-5
describe('fetching songs with a message', () => {
  it('includes the message as Say if not URL', done => {
    fetch.mockReturnValue(Promise.resolve(
        new FetchResponse(
            '<ListBucketResult><Prefix/>' +
            '<Contents><Key>foo.mp3</Key></Contents>' +
            '</ListBucketResult>'
        )
    ));

    const callback = callbackHelper(done, (err, result) => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('http://example.s3.amazonaws.com/', {timeout: 5000});

      expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
      expect(result.toString()).toMatch(
          '<Response><Play>http://example.s3.amazonaws.com/foo.mp3</Play><Say>hello world</Say><Redirect/></Response>'
      );
    });

    holdMusicHandler({BUCKET: 'example', MESSAGE: 'hello world'}, {}, callback);
  });

  it('includes the includes message as Play if URL', done => {
    fetch.mockReturnValue(Promise.resolve(
        new FetchResponse(
            '<ListBucketResult><Prefix/>' +
            '<Contents><Key>foo.mp3</Key></Contents>' +
            '</ListBucketResult>'
        )
    ));

    const callback = callbackHelper(done, (err, result) => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('http://example.s3.amazonaws.com/', {timeout: 5000});

      expect(result).toBeInstanceOf(Twilio.twiml.VoiceResponse);
      expect(result.toString()).toMatch(
          '<Response><Play>http://example.s3.amazonaws.com/foo.mp3</Play><Play>https://example.com/testing</Play><Redirect/></Response>'
      );
    });

    holdMusicHandler({BUCKET: 'example', MESSAGE: 'https://example.com/testing'}, {}, callback);
  });
});


describe('an uncaught exception occurs in the handler', () => {
  afterEach(() => {
    if (Twilio.twiml.VoiceResponse.mockRestore) {
      Twilio.twiml.VoiceResponse.mockRestore();
    }
  });

  it('passes the error to the callback', done => {
    let expected = new Error('testing');

    let mockVoiceResponse = jest.spyOn(Twilio.twiml, 'VoiceResponse');

    mockVoiceResponse.mockImplementation(() => { throw expected; });

    const callback = callbackHelper(done, (err, result) => {
      expect(result).toBeNull();

      expect(err).not.toBeNull();
      expect(err).toEqual(expected);
    });

    holdMusicHandler({BUCKET: 'example'}, {}, callback);
  });
});
