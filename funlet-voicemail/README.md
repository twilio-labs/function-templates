# Voicemail Funlet

This Twilio Function is based on the [Twimlet of the same name][twimlet].

[twimlet]: https://www.twilio.com/labs/twimlets/voicemail

It can be used as a drop-in replacement for the Twimlet, by using the URL
of the Twilio Function as a webhook with the same GET parameters.

Alternatively, it can be customized by setting properties in the
environment. GET and POST parameters are considered first, if provided,
then environment properties, then config properties declared in the script.

Environment properties are most convenient when you are using a single
instance of this script in your account. To customize multiple instances,
the recommended way is to modify the script parameters in the config object,
directly in the script.

## Stages

The Voicemail Funlet has three stages:

| Stage | Addressing | Description |
| ----: | :--------- | :---------- |
|     1 | Caller     | Record voicemail |
|     2 | Caller     | After recording, thank caller and send email notification, unless transcription is pending |
|     3 | Caller     | Send email notification after transcription, if it was requested |

These three stages would typically be implemented in three separate Twilio
Functions. In the Voicemail Funlet, they are running in three separate
instances of the same Twilio Function. This is in line with the original
Voicemail Twimlet, which implemented both stages in the same script.

## Input

### Email

Text string, email address to send a notification with the link
to the recorded voicemail.

1. Event: `Email` parameter
2. Environment: `FUNLET_VOICEMAIL_EMAIL` environment property
3. Script: `email` config property

### Transcribe

Boolean, whether to include a transcription of the voicemail
in the email notification; defaults to true.

1. Event: `Transcribe` parameter
2. Environment: `FUNLET_VOICEMAIL_TRANSCRIBE` environment property
3. Script: `transcribe` config property

### Message

Text string, a recording URL or a text to say to invite the caller
to leave a message.
*(A string starting with 'http' is considered to be a URL)*

1. Event: `Message` parameter
2. Environment: `FUNLET_VOICEMAIL_MESSAGE` environment property
3. Script: `message` config property

### Language

Text string, language code for text messages, e.g. 'en' or 'en-gb'.
Defaults to 'en': English with an American accent.

1. Event: `Language` parameter
2. Environment: `FUNLET_VOICEMAIL_LANGUAGE` environment property
3. Script: `language` config property

### Voice

Text string, voice for text messages, one of 'man', 'woman' or 'alice'.
Defaults to 'alice', who speaks in a large selection languages.

1. Event: `Voice` parameter
2. Environment: `FUNLET_VOICEMAIL_VOICE` environment property
3. Script: `voice` config property

### Caller

Text string, the caller's phone number.

1. Event: `From` or `Caller` property provided by the Twilio Voice event

### Recording URL (Stage 2 and Stage 3)

Stage 2: When a recording has completed.
Stage 3: When an optional transcription has completed.
Text string, URL of the voicemail recording.

1. Event: `RecordingUrl` property provided by `<Record>`

### Transcription Status (Stage 3)

Stage 3: When an optional transcription has completed.
Text string, status of the speech-to-text transcription of the recording.

1. Event: `TranscriptionStatus` property provided by `<Record>`

### Transcription Text (Stage 3)

Text string, speech-to-text transcription of the recording.

1. Event: `TranscriptionText` property provided by `<Record>`

## Output

This Twilio Function returns TwiML instructions for Twilio Voice.
