# Twilio Function Templates

[![A Twilio Labs Project](https://img.shields.io/static/v1?label=&message=Twilio-Labs&color=F22F46&labelColor=0D122B&logo=twilio&style=flat-square)](https://www.twilio.com/labs) 

[Twilio Functions](https://www.twilio.com/functions) are a serverless environment to build and run Twilio applications so you can get to production faster. You provide the Node.js code to perform the task you need and Twilio runs it. You can read [more about Twilio Functions and how to use them in the introductory blog post](https://www.twilio.com/blog/2017/05/introducing-twilio-functions.html).

### Attention

With the release of Node v18, the Node.js ecosystem is migrating over from the old CommonJS (CJS) standard to the newer, ES Modules (ESM) standard. Using ESM modules in CJS code is not possible. You can read about the differences in far more detail in this [blog Post.](https://redfin.engineering/node-modules-at-war-why-commonjs-and-es-modules-cant-get-along-9617135eeca1). The following snippets may causes errors. 

These templates are also available through `twilio-run new` inside the [`twilio-run`](https://npm.im/twilio-run) CLI.

## Usage

Each Function lives in its own directory within this repo. The easiest way to use the templates is through the Twilio CLI. [Check out our docs for the different ways you can use these templates](docs/USING_FUNCTIONS.md).

## Available Functions

[Complete list of available functions](docs/templates.md)

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
