# Hold Music

Plays the audio fields in an [Amazon S3 Bucket][s3-homepage] in a loop,
optionally playing a URL or saying a message between each song.

This Twilio Function is based on the [Twimlet of the same name][twimlet].

[twimlet]: https://www.twilio.com/labs/twimlets/hold-music

It can be used as a drop-in replacement for the Twimlet, by using the URL
of the Twilio Function as a webhook with the same GET parameters.

## Environment variables

This Function expects the following environment variables set:

| Variable  | Meaning                                                                               | Required |
| :-------- | :------------------------------------------------------------------------------------ | :------- |
| `BUCKET`  | The public [Amazon S3 bucket][s3-homepage] to read the music files from. | Yes      |
| `MESSAGE` | A URL of a file to play, or text to say, between songs.                               | No       |

## Parameters

This Function requires no URL or POST parameters to run successfully.

[s3-homepage]: https://s3.amazonaws.com/