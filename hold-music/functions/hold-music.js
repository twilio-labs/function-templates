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

  try {
    let res = await fetch(bucketURL, {timeout: FETCH_TIMEOUT});

    let result = parser.parse(await res.text());

    if (!result || !result['ListBucketResult'] || !result['ListBucketResult']['Contents']) {
      return [];
    }

    let contents = result['ListBucketResult']['Contents'];

    contents = Array.isArray(contents) ? contents : [contents];
    return contents
        .map(c => getBucketURL(bucket, c['Key']))
        .filter(c => c.match(VALID_MUSIC_REGEX));
  } catch (err) {
    return [];
  }
}

async function getHoldMusicTwiml(bucketName, message) {
  const twiml = new Twilio.twiml.VoiceResponse();

  if (!bucketName) {
    twiml.say('An S 3 bucket is required.');
    return twiml;
  }

  let playlist = await getBucketMusic(bucketName);

  if (!playlist || playlist.length === 0) {
    twiml.say('Failed to fetch the hold music.');

    return twiml;
  }

  playlist = shuffle(playlist);

  for (let songURL of playlist) {
    twiml.play(songURL);

    if (isURL(message)) {
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
