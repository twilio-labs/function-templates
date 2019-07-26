# Voicemail Funlet

This Twilio Function is based on the [Twimlet of the same name][twimlet].

[twimlet]: https://www.twilio.com/labs/twimlets/voicemail

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

### Email

Text string, email address to send a notification with the link
to the recorded voicemail.

1. Event
  o GET: `Email` parameter
  o POST: `Email` property
2. Environment: `FUNLET_VOICEMAIL_EMAIL` environment property
3. Script: `MY_EMAIL` constant

### Transcribe

Boolean, whether to include a transcription of the voicemail
in the email notification; defaults to true.

1. Event
  o GET: `Transcribe` parameter
  o POST: `Transcribe` property
2. Environment: `FUNLET_VOICEMAIL_TRANSCRIBE` environment property
3. Script: `MY_TRANSCRIBE` constant

### Message

Text string: a recording URL or a text to say to invite the caller
to leave a message.
*(A string starting with 'http' is considered to be a URL)*

1. Event
  o GET: `Message` parameter
  o POST: `Message` property
2. Environment: `FUNLET_VOICEMAIL_MESSAGE` environment property
3. Script: `MY_MESSAGE` constant

### Caller

Text string, the caller's phone number.

1. Event: `From` or `Caller` property provided by the Twilio Voice event

### Recording URL (Stage 2 and Stage 3)

Stage 2: When a recording has completed.
Stage 3: When an optional transcription has completed.
Text string, URL of the voicemail recording.

1. Event
  o POST: `RecordingUrl` property provided by `<Record>`

### Transcription Status (Stage 3)

Stage 3: When an optional transcription has completed.
Text string, status of the speech-to-text transcription of the recording.

1. Event
  o POST: `TranscriptionStatus` property provided by `<Record>`

### Transcription Text (Stage 3)

Text string, speech-to-text transcription of the recording.

1. Event
  o POST: `TranscriptionText` property provided by `<Record>`

## Output

This Twilio Function returns TwiML instructions for Twilio Voice.
