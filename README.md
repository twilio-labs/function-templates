# Twilio Function Templates

[![Build Status](https://travis-ci.org/twilio-labs/function-templates.svg?branch=master)](https://travis-ci.org/twilio-labs/function-templates)

[Twilio Functions](https://www.twilio.com/functions) are a serverless environment to build and run Twilio applications so you can get to production faster. You provide the Node.js code to perform the task you need and Twilio runs it. You can read [more about Twilio Functions and how to use them in the introductory blog post](https://www.twilio.com/blog/2017/05/introducing-twilio-functions.html).

## This repo

This repo is intended to be a collection of useful Twilio Functions that are tested and documented. The intention is that you can take any of these Functions and drop them into a project, confident they will work, whether you are a developer looking for a particular building block or a builder who just needs a particular Function. These templates are also available through `twilio-run new` inside the [`twilio-run`](https://npm.im/twilio-run) CLI.

## Usage

Each Function lives in its own directory within this repo. To use the code, copy the contents of the main Function file to your Twilio Function. Make sure you read the Function README so that you know which environment variables to set and the parameters the Function takes when you make HTTP requests to it.

## Available Functions

This is the list of Functions available in this repo:

- [Blank Template](blank) - Barebones template to get started
- [Hello World](hello-world) - A very basic Function to get this repo started
- [Hello Voice](hello-voice) - Function to get you started with Twilio Prog. Voice
- [Hello Messaging](hello-messaging) - Function to get you started with Twilio Prog. Messaging
- [Forward Call](forward-call) - Forwards an incoming call to another number
- [Forward Message](forward-message) - Forward incoming SMS messages to another number
- [Forward Message to Multiple Numbers](forward-message-multiple) - Forwards incoming messages to a set of numbers
- [Forward Message to Email via SendGrid](forward-message-sendgrid) - Uses SendGrid to forward incoming messages via email
- [Forward Message to Email via Sparkpost](forward-message-sparkpost) - Uses Sparkpost to forward incoming messages via email
- [Hunt/Find me](hunt) - Call a list of numbers in order until one answers
- [Generate Video access token](video-token) - Generates a Video Access Token for client-side applications
- [Generate Sync access token](sync-token) - Generates a Sync Access Token for client-side applications
- [Generate Chat access token](chat-token) - Generates a Chat Access Token for client-side applications
- [Conference line](conference) - Simple TwiML to drop callers into a conference call called "Snowy Owl"
- [Simple play](never-gonna-give-you-up) - TwiML to `<Play>` an mp3
- [HTTP Redirect](http-redirect) - Redirects a request from Twilio Functions to another URL by setting the Location header to the respective URL
- [Temp Storage](temp-storage) - Function that shows you where files created in a Twilio Function go and how to manage them for one-off activities
- [Verify](verify) - Functions to send and check one-time passwords via SMS or Voice for phone verification

### Todo

- [ ] Forward message to email with other API providers
- [ ] Generate Twilio Client access token
- [ ] Voicemail
- [ ] Inbound calls for SIP registration
- [ ] Outbound calls for SIP registration
- [ ] Translate webhook from `application/x-www-form-urlencoded` into `application/json` and forward on to another service

Please add ideas if you have them.

## Contribute

Pull requests and new Functions are accepted. To make a contribution, follow these steps:

1. Fork this repository ( https://github.com/twilio-labs/function-templates/fork )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create a new Pull Request

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

### Install

This project and Twilio Functions use Node.js version 8.10. I recommend using [nvm](https://github.com/creationix/nvm) if you need to install multiple versions of Node.js. Clone or download the project, use the correct version of Node.js and install the dependencies:

```bash
nvm use
npm install
```

### Tests

Tests are written with [Jest](https://facebook.github.io/jest/). Run them with:

```bash
npm test
```

## License

MIT © Phil Nash
