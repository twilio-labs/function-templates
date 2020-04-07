const URL = require('url').URL;

const fetch = require('node-fetch');
const parser = require('fast-xml-parser');

const FETCH_TIMEOUT = 5000;

const VALID_MUSIC_REGEX = /\.(mp3|wav|ul)$/i;

function shuffle(arr) {
  arr = arr.slice();

  let len = arr.length;

  while (len) {
    let random = Math.floor(Math.random() * len);
    len -= 1;
    let temp = arr[len];
    arr[len] = arr[random];
    arr[random] = temp;
  }

  return arr;
}

function getBucketURL(bucket, path) {
  const base = 'http://' + bucket + '.s3.amazonaws.com';
  path = path || '/';

  return new URL(path, base).toString();
}

function isURL(input) {
  try {
    new URL(input);
  } catch (e) {
    return false;
  }
  return true;
}

async function getBucketMusic(bucket) {
  const bucketURL = getBucketURL(bucket);

  let res = await fetch(bucketURL, {timeout: FETCH_TIMEOUT});

  // If S3 responds with a response outside of 200 level / 300 level then
  // let's throw an exception because something's real wrong here.
  if (!res.ok) {
    throw new Error('Invalid Response from S3');
  }

  let doc = parser.parse(await res.text());

  // In various cases the response message will be `ok` but the response won't
  // have any contents.  This is no good and we should assume no records.
  if (!doc || !doc['ListBucketResult'] || !doc['ListBucketResult']['Contents']) {
    return [];
  }

  let contents = doc['ListBucketResult']['Contents'];

  // `Contents` are an XML element, and the response can be One or Many.
  // As such, the XML parser doesn't know that we want an array, so
  // let's coerce our results if they aren't an array.
  contents = Array.isArray(contents) ? contents : [contents];

  return contents
      .map(c => getBucketURL(bucket, c['Key']))
      .filter(c => isURL(c) && c.match(VALID_MUSIC_REGEX));

}

async function getHoldMusicTwiml(bucketName, message) {
  const twiml = new Twilio.twiml.VoiceResponse();

  if (!bucketName) {
    twiml.say('An S 3 bucket is required.');
    return twiml;
  }

  let playlist;

  try {
    playlist = await getBucketMusic(bucketName);
  } catch (err) {
    // In case of an error, to match the Twimlet we're going to respond as if
    // there was no hold music found.
    playlist = [];
  }

  if (!playlist || playlist.length === 0) {
    // There are various reasons why we wouldn't be able to get the bucket music.
    // In these cases we need to inform the caller.
    twiml.say('Failed to fetch the hold music.');
    return twiml;
  }

  playlist = shuffle(playlist);

  for (let songURL of playlist) {
    twiml.play(songURL);

    if (isURL(message)) {
      // If the message is a URL we're support to play it as music
      twiml.play(message);
    } else if (message) {
      twiml.say(message);
    }
  }

  twiml.redirect();

  return twiml;
}

function getParameter(key, context, event) {
  if (context && context[key.toUpperCase()]) {
    return context[key.toUpperCase()];
  }

  if (event) {
    // It's unclear the casing that can be brought into the `event` object - as such,
    // let's search throw the event keys until we find something that matches..
    let eventKey = Object.keys(event).find(k => k.toLowerCase() === key.toLowerCase());

    if (eventKey) {
      return event[eventKey];
    }
  }

  return null;
}

exports.handler = async function(context, event, callback) {
  const bucketName = getParameter('bucket', context, event);
  const message = getParameter('message', context, event);

  try {
    let twiml = await getHoldMusicTwiml(bucketName, message);
    callback(null, twiml);
  } catch(err) {
    callback(err, null);
  }
};
