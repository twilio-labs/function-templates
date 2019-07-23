# Conference Funlet

This Twilio Function is based on the [Twimlet of the same name][twimlet].

[twimlet]: https://www.twilio.com/labs/twimlets/conference

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

### Password

Number, a sequence of one or more digits that must be entered by callers
to be allowed in the conference.

1. Event
  o GET: `Password` parameter
  o POST: `Password` property
2. Environment: `FUNLET_CONFERENCE_PASSWORD` environment property
3. Script: `MY_PASSWORD`

### Name

Text string, the name which identifies the conference, uniquely,
in the context of the Twilio account.

1. Event
  o GET: `Name` parameter
  o POST: `Name` property
2. Environment: `FUNLET_CONFERENCE_NAME` environment property
3. Script: `MY_NAME`

### Message

Text string: a recording URL or a text to say before a caller
enters the conference.
*(A string starting with 'http' is considered to be a URL)*

1. Event
  o GET: `Message` parameter
  o POST: `Message` property
2. Environment: `FUNLET_CONFERENCE_MESSAGE` environment property
3. Script: `MY_MESSAGE` constant

### Music

Text string:
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

1. Event
  o GET: `Music` parameter
  o POST: `Music` property
2. Environment: `FUNLET_CONFERENCE_MUSIC` environment property
3. Script: `MY_MUSIC` constant

### Moderators

A list of text strings with the phone numbers of moderators.

1. Event
  o GET: a single `Moderators=` or a list of `Moderators[]=` parameters
  o POST: `Moderators` string or array of string values
2. Environment: up to five moderators,
  each in a separate environment property:
  - `FUNLET_CONFERENCE_MODERATOR1`,
  - `FUNLET_CONFERENCE_MODERATOR2`,
  - `FUNLET_CONFERENCE_MODERATOR3`,
  - `FUNLET_CONFERENCE_MODERATOR4`,
  - `FUNLET_CONFERENCE_MODERATOR5`
3. Script: `MY_MODERATORS` constant string or array of string values

### EnableSmsNotifications

Boolean, whether to send an SMS to notify each moderator
each time a caller who is not a moderator joins the conference;
defaults to false.

1. Event
  o GET: `EnableSmsNotifications` parameter
  o POST: `EnableSmsNotifications` property
2. Environment: `FUNLET_CONFERENCE_SMS_NOTIFICATIONS` environment property
3. Script: `MY_SMS_NOTIFICATIONS`

### Caller

Text string, the caller's phone number.

1. Event: `From` or `Caller` property provided by the Twilio Voice event

### Phone Number Called

Text string, the Twilio phone number called for the conference.

1. Event: `To` or `Called` property provided by the Twilio Voice event

## Output

This Twilio Function returns TwiML instructions for Twilio Voice.
