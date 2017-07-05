# Useful Twilio Functions

[![Build Status](https://travis-ci.org/philnash/useful-twilio-functions.svg?branch=master)](https://travis-ci.org/philnash/useful-twilio-functions)

[Twilio Functions](https://www.twilio.com/functions) are a serverless environment to build and run Twilio applications so you can get to production faster. You provide the Node.js code to perform the task you need and Twilio runs it. You can read [more about Twilio Functions and how to use them in the introductory blog post](https://www.twilio.com/blog/2017/05/introducing-twilio-functions.html).

## This repo

This repo is intended to be a collection of useful Twilio Functions that are tested and documented. The intention is that you can take any of these Functions and drop them into a project, confident they will work. Whether you are a developer looking for a particular building block or a builder who justs needs a particular Function.

## Usage

Each Function lives in its own directory within this repo. To use the code, copy the contents of the main Function file to your Twilio Function. Make sure you read the Function README so that you know which environment variables to set and the parameters the Function takes when you make HTTP requests to it.

## Available Functions

This is the list of Functions available in this repo:

* [Hello world](helloWorld) - A very basic Function to get this repo started

## Contribute

Pull requests and new Functions are accepted. To make a contribution, follow these steps:

1. Fork this repository ( https://github.com/philnash/useful-twilio-functions/fork )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create a new Pull Request

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT). By participating in this project you agree to abide by its terms.

### Install

This project uses Node.js version 6.10.2. I recommend using [nvm](https://github.com/creationix/nvm) if you need to install multiple versions of Node.js. Clone or download the project, use the correct version of Node.js and install the dependencies:

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
