const URL = require('url').URL;

const fetch = require('node-fetch');
const parser = require('fast-xml-parser');

const FETCH_TIMEOUT = 5000;

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

function getBucketMusic(bucket) {
  const bucketURL = getBucketURL(bucket);

  return fetch(bucketURL, { timeout: FETCH_TIMEOUT })
      .then(res => res.text())
      .then(text => parser.parse(text))
      .then(result => {
          if (!result || !result['ListBucketResult'] || !result['ListBucketResult']['Contents']) {
              return [];
          }

          let contents = result['ListBucketResult']['Contents'];

          return Array.isArray(contents) ? contents : [contents];
      })
      .then(contents => contents.map(c => getBucketURL(bucket, c['Key'])).filter(c => c.match(/\.(mp3|wav|ul)$/i)))
      .catch(() => []);
}

function isURL(input) {
  try {
    new URL(input);
  } catch (e) {
    return false;
  }
  return true;
}

exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();

  const bucketName = context.BUCKET || null;
  const message = context.MESSAGE || null;

  if (!bucketName) {
    twiml.say('An S 3 bucket is required.');
    callback(null, twiml);

    return
  }

  return getBucketMusic(bucketName)
      .then(playlist => {
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
      })
      .then(twiml => callback(null, twiml));
};
