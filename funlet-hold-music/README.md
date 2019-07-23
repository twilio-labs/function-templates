# Hold Music Funlet

This Twilio Function is based on the [Twimlet of the same name][twimlet].

[twimlet]: https://www.twilio.com/labs/twimlets/holdmusic

It can be used as a drop-in replacement for the Twimlet, with the
same GET parameters, by using the URL of the Twilio Function as
a webhook with the GET method.

Alternatively, it can be customized by setting properties in the
environment. GET or POST parameters are considered first, if provided,
then environment properties, then default values declared in the script.

Environment properties are most convenient when you are using a single
instance of this script in your account. To customize multiple instances,
the recommended way is to modify the default values directly in each copy
of the script.

You will find a separate accessor function for each parameter at the
beginning of the script, where you can change just these default value.
You may also rewrite these functions fully to better accommodate your needs.

## Input

### Bucket

Text string, a public Amazon S3 bucket which contains a list of music files
to play, with the extension '.mp3', '.wav' or '.ul'.

1. Event
  o GET: `Bucket` parameter
  o POST: `Bucket` property
2. Environment: `FUNLET_HOLDMUSIC_BUCKET` environment property
3. Script: `MY_BUCKET` constant

### Message

Text string: a recording URL or a text to say between songs.
*(A string starting with 'http' is considered to be a URL)*

1. Event
  o GET: `Message` parameter
  o POST: `Message` property
2. Environment: `FUNLET_HOLDMUSIC_MESSAGE` environment property
3. Script: `MY_MESSAGE` constant

## Output

This Twilio Function returns TwiML instructions for Twilio Voice.
