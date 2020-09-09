# Twilio Function Templates

[![Build Status](https://travis-ci.org/twilio-labs/function-templates.svg?branch=master)](https://travis-ci.org/twilio-labs/function-templates) [![A Twilio Labs Project](https://img.shields.io/static/v1?label=&message=Twilio-Labs&color=F22F46&labelColor=0D122B&logo=twilio&style=flat-square)](https://www.twilio.com/labs) [![Learn with TwilioQuest](https://img.shields.io/static/v1?label=TwilioQuest&message=Learn%20to%20contribute%21&color=F22F46&labelColor=1f243c&style=flat-square&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAASFBMVEUAAAAZGRkcHBwjIyMoKCgAAABgYGBoaGiAgICMjIyzs7PJycnMzMzNzc3UoBfd3d3m5ubqrhfrMEDu7u739/f4vSb/3AD///9tbdyEAAAABXRSTlMAAAAAAMJrBrEAAAKoSURBVHgB7ZrRcuI6EESdyxXGYoNFvMD//+l2bSszRgyUYpFAsXOeiJGmj4NkuWx1Qeh+Ekl9DgEXOBwOx+Px5xyQhDykfgq4wG63MxxaR4ddIkg6Ul3g84vCIcjPBA5gmUMeXESrlukuoK33+33uID8TWeLAdOWsKpJYzwVMB7bOzYSGOciyUlXSn0/ABXTosJ1M1SbypZ4O4MbZuIDMU02PMbauhhHMHXbmebmALIiEbbbbbUrpF1gwE9kFfRNAJaP+FQEXCCTGyJ4ngDrjOFo3jEL5JdqjF/pueR4cCeCGgAtwmuRS6gDwaRiGvu+DMFwSBLTE3+jF8JyuV1okPZ+AC4hDFhCHyHQjdjPHUKFDlHSJkHQXMB3KpSwXNGJPcwwTdZiXlRN0gSp0zpWxNtM0beYE0nRH6QIbO7rawwXaBYz0j78gxjokDuv12gVeUuBD0MDi0OQCLvDaAho4juP1Q/jkAncXqIcCfd+7gAu4QLMACCLxpRsSuQh0igu0C9Svhi7weAGZg50L3IE3cai4IfkNZAC8dfdhsUD3CgKBVC9JE5ABAFzg4QL/taYPAAWrHdYcgfLaIgAXWJ7OV38n1LEF8tt2TH29E+QAoDoO5Ve/LtCQDmKM9kPbvCEBApK+IXzbcSJ0cIGF6e8gpcRhUDogWZ8JnaWjPXc/fNnBBUKRngiHgTUSivSzDRDgHZQOLvBQgf8rRt+VdBUUhwkU6VpJ+xcOwQUqZr+mR0kvBUgv6cB4+37hQAkXqE8PwGisGhJtN4xAHMzrsgvI7rccXqSvKh6jltGlrOHA3Xk1At3LC4QiPdX9/0ndHpGVvTjR4bZA1ypAKgVcwE5vx74ulwIugDt8e/X7JgfkucBMIAr26ndnB4UCLnDOqvteQsHlgX9N4A+c4cW3DXSPbwAAAABJRU5ErkJggg==)](https://twil.io/learn-open-source)

[Twilio Functions](https://www.twilio.com/functions) are a serverless environment to build and run Twilio applications so you can get to production faster. You provide the Node.js code to perform the task you need and Twilio runs it. You can read [more about Twilio Functions and how to use them in the introductory blog post](https://www.twilio.com/blog/2017/05/introducing-twilio-functions.html).

## This repo

This repo is intended to be a collection of useful Twilio Functions that are tested and documented. The intention is that you can take any of these Functions and drop them into a project, confident they will work, whether you are a developer looking for a particular building block or a builder who just needs a particular Function. These templates are also available through `twilio-run new` inside the [`twilio-run`](https://npm.im/twilio-run) CLI.

## Usage

Each Function lives in its own directory within this repo. The easiest way to use the templates is through the Twilio CLI. [Check out our docs for the different ways you can use these templates](docs/USING_FUNCTIONS.md).

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
- [Stripe SMS Receipt](stripe-sms-receipt) - Send an SMS receipt to your Stripe customers based on webhook events.
- [Generate Sync access token](sync-token) - Generates a Sync Access Token for client-side applications
- [Generate Chat access token](chat-token) - Generates a Chat Access Token for client-side applications
- [Conference line](conference) - Simple TwiML to drop callers into a conference call called "Snowy Owl"
- [Simple play](never-gonna-give-you-up) - TwiML to `<Play>` an mp3
- [HTTP Redirect](http-redirect) - Redirects a request from Twilio Functions to another URL by setting the Location header to the respective URL
- [Temp Storage](temp-storage) - Function that shows you where files created in a Twilio Function go and how to manage them for one-off activities
- [Verify](verify) - Functions to send and check one-time passwords via SMS or Voice for phone verification
- [Email Verification Magic Links](magic-links) - Send one-click email verification using Verify and SendGrid

### Todo

- [ ] Forward message to email with other API providers
- [ ] Generate Twilio Client access token
- [ ] Inbound calls for SIP registration
- [ ] Outbound calls for SIP registration
- [ ] Translate webhook from `application/x-www-form-urlencoded` into `application/json` and forward on to another service

Please add ideas if you have them.

## Contributing

This project welcomes contributions. Please check out our [Contributing guide](docs/CONTRIBUTING.md) to learn more on how to get started.

## License

MIT © Twilio Inc.
