# Twilio Function Templates

[![A Twilio Labs Project](https://img.shields.io/static/v1?label=&message=Twilio-Labs&color=F22F46&labelColor=0D122B&logo=twilio&style=flat-square)](https://www.twilio.com/labs) [![Learn with TwilioQuest](https://img.shields.io/static/v1?label=TwilioQuest&message=Learn%20to%20contribute%21&color=F22F46&labelColor=1f243c&style=flat-square&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAASFBMVEUAAAAZGRkcHBwjIyMoKCgAAABgYGBoaGiAgICMjIyzs7PJycnMzMzNzc3UoBfd3d3m5ubqrhfrMEDu7u739/f4vSb/3AD///9tbdyEAAAABXRSTlMAAAAAAMJrBrEAAAKoSURBVHgB7ZrRcuI6EESdyxXGYoNFvMD//+l2bSszRgyUYpFAsXOeiJGmj4NkuWx1Qeh+Ekl9DgEXOBwOx+Px5xyQhDykfgq4wG63MxxaR4ddIkg6Ul3g84vCIcjPBA5gmUMeXESrlukuoK33+33uID8TWeLAdOWsKpJYzwVMB7bOzYSGOciyUlXSn0/ABXTosJ1M1SbypZ4O4MbZuIDMU02PMbauhhHMHXbmebmALIiEbbbbbUrpF1gwE9kFfRNAJaP+FQEXCCTGyJ4ngDrjOFo3jEL5JdqjF/pueR4cCeCGgAtwmuRS6gDwaRiGvu+DMFwSBLTE3+jF8JyuV1okPZ+AC4hDFhCHyHQjdjPHUKFDlHSJkHQXMB3KpSwXNGJPcwwTdZiXlRN0gSp0zpWxNtM0beYE0nRH6QIbO7rawwXaBYz0j78gxjokDuv12gVeUuBD0MDi0OQCLvDaAho4juP1Q/jkAncXqIcCfd+7gAu4QLMACCLxpRsSuQh0igu0C9Svhi7weAGZg50L3IE3cai4IfkNZAC8dfdhsUD3CgKBVC9JE5ABAFzg4QL/taYPAAWrHdYcgfLaIgAXWJ7OV38n1LEF8tt2TH29E+QAoDoO5Ve/LtCQDmKM9kPbvCEBApK+IXzbcSJ0cIGF6e8gpcRhUDogWZ8JnaWjPXc/fNnBBUKRngiHgTUSivSzDRDgHZQOLvBQgf8rRt+VdBUUhwkU6VpJ+xcOwQUqZr+mR0kvBUgv6cB4+37hQAkXqE8PwGisGhJtN4xAHMzrsgvI7rccXqSvKh6jltGlrOHA3Xk1At3LC4QiPdX9/0ndHpGVvTjR4bZA1ypAKgVcwE5vx74ulwIugDt8e/X7JgfkucBMIAr26ndnB4UCLnDOqvteQsHlgX9N4A+c4cW3DXSPbwAAAABJRU5ErkJggg==)](https://twil.io/learn-open-source)

[Twilio Functions](https://www.twilio.com/functions) are a serverless environment to build and run Twilio applications so you can get to production faster. You provide the Node.js code to perform the task you need and Twilio runs it. You can read [more about Twilio Functions and how to use them in the introductory blog post](https://www.twilio.com/blog/2017/05/introducing-twilio-functions.html).

## This repo

This repo is intended to be a collection of useful Twilio Functions that are tested and documented. The intention is that you can take any of these Functions and drop them into a project, confident they will work, whether you are a developer looking for a particular building block or a builder who just needs a particular Function. These templates are also available through `twilio-run new` inside the [`twilio-run`](https://npm.im/twilio-run) CLI.

## Usage

Each Function lives in its own directory within this repo. The easiest way to use the templates is through the Twilio CLI. [Check out our docs for the different ways you can use these templates](docs/USING_FUNCTIONS.md).

## Available Functions

[Complete list of available functions](./docs/templates.md)

## Github Pages

The Quick Deploy Functions in this repo contain an `index.html` asset that is displayed after a deployment succeeds. That `index.html` file is served by the Function itself, but several static assets shared by every `index.html` are served by Github Pages from the `/docs/static` directory of this repo. These files all follow [semver](https://semver.org/) versioning, and are located in a subdirectory of `/docs/static` named after their semver major version number. For example, a file of version `1.2.3` should have a comment header containing `Version: 1.2.3` (if possible), and be located in the `v1` subdirectory of `/docs/static`.

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
