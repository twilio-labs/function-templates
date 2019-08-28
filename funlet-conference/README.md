# Conference Funlet

This Twilio Function is based on the [Twimlet of the same name][twimlet].

[twimlet]: https://www.twilio.com/labs/twimlets/conference

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

The Conference Funlet has two stages:

| Stage | Addressing | Description |
| ----: | :--------- | :---------- |
|     1 | Caller     | Check the conference password digits |
|     2 | Caller     | Welcome the caller to the conference and notify moderators |

These two stages would typically be implemented in two separate Twilio
Functions. In the Conference Funlet, they are running in two separate
instances of the same Twilio Function. This is in line with the original
Conference Twimlet, which implemented both stages in the same script.

## Input

### Password

Number, a sequence of one or more digits that must be entered by callers
to be allowed in the conference.

1. Event: `Password` parameter
2. Environment: `FUNLET_CONFERENCE_PASSWORD` environment property
3. Script: `password` config property

### Name

Text string, the name which identifies the conference, uniquely,
in the context of the Twilio account.

1. Event: `Name` parameter
2. Environment: `FUNLET_CONFERENCE_NAME` environment property
3. Script: `name` config property

### Password Request Message

Text string, a recording URL or a text to say to request the caller
to provide password digits to access the conference.

1. Event: `PasswordRequest` parameter
2. Environment: `FUNLET_CONFERENCE_PASSWORD_REQUEST` environment property
3. Script: `passwordRequest` config property

### Message

Text string, a recording URL or a text to say before a caller
enters the conference.
*(A string starting with 'http' is considered to be a URL)*

1. Event: `Message` parameter
2. Environment: `FUNLET_CONFERENCE_MESSAGE` environment property
3. Script: `message` config property

### Language

Text string, language code for text messages, e.g. 'en' or 'en-gb'.
Defaults to 'en': English with an American accent.

1. Event: `Language` parameter
2. Environment: `FUNLET_CONFERENCE_LANGUAGE` environment property
3. Script: `language` config property

### Voice

Text string, voice for text messages, one of 'man', 'woman' or 'alice'.
Defaults to 'alice', who speaks in a large selection languages.

1. Event: `Voice` parameter
2. Environment: `FUNLET_CONFERENCE_VOICE` environment property
3. Script: `voice` config property

### Music

Text string,
- name of a Twilio genre:
  o 'ambient'
  o 'classical',
  o 'electronica'
  o 'guitars'
  o 'rock'
  o 'soft-rock'
- or URL to a TwiML script with instructions to play music
- or URL to a music recording to play
*(A string starting with 'http' is considered to be a URL.
Any text string that is **not** one of the listed Twilio genres
and does not start with 'http' is silently discarded.)*

1. Event: `Music` parameter
2. Environment: `FUNLET_CONFERENCE_MUSIC` environment property
3. Script: `music` config property

### Moderators

A list of text strings with the phone numbers of moderators.

1. Event: a single `Moderators=` or a list of `Moderators[]=` parameters
2. Environment: up to five moderators,
  each in a separate environment property:
  - `FUNLET_CONFERENCE_MODERATOR1`,
  - `FUNLET_CONFERENCE_MODERATOR2`,
  - `FUNLET_CONFERENCE_MODERATOR3`,
  - `FUNLET_CONFERENCE_MODERATOR4`,
  - `FUNLET_CONFERENCE_MODERATOR5`
3. Script: `moderators` config property string or array of string values

### EnableSmsNotifications

Boolean, whether to send an SMS to notify each moderator
each time a caller who is not a moderator joins the conference;
defaults to false.

1. Event: `EnableSmsNotifications` parameter
2. Environment: `FUNLET_CONFERENCE_SMS_NOTIFICATIONS` environment property
3. Script: `smsNotifications` config property

### Caller

Text string, the caller's phone number.

1. Event: `From` or `Caller` property provided by the Twilio Voice event

### Phone Number Called

Text string, the Twilio phone number called for the conference.

1. Event: `To` or `Called` property provided by the Twilio Voice event

## Output

This Twilio Function returns TwiML instructions for Twilio Voice.
