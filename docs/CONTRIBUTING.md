# Contributing to Function Templates

## What are good ways to contribute?

We welcome any kind of contributions. From filing issues, to fixing typos and bugs all the way to creating entirely new templates.

Please be aware though that pull requests that only reword sentences that might already convey the content correctly, might not be merged.

If this is your first time contributing to an open-source project, [check out our TwilioQuest tutorial](https://www.twilio.com/quest/learn/open-source) that will teach you in a fun way how to contribute to a project.

## Requirements

- A GitHub account
- git installed on your computer. [Learn how to install it](https://help.github.com/en/articles/set-up-git)
- [Node.js](https://nodejs.org) and a package manager like [npm](https://npmjs.com)

## Setting up your local environment

1. [Fork this repository](https://github.com/twilio-labs/function-templates/fork)
2. Clone the repository:

```bash
git clone git@github.com:YOUR_GITHUB_USERNAME/function-templates.git
```

3. Install dependencies:

> **Note**: Twilio Functions run in a specific Node.js environment. We keep the currently supported version up-to-date in the .nvmrc file in this project. It's recommended to use a tool like [nvm](https://github.com/creationix/nvm) to pick the right version of Node.js before installing the dependencies.

```bash
cd function-templates
# nvm use # if you use the nvm tool
npm install
```

4. Verify setup by running tests:

```bash
npm test
```

## Creating a new function template

Creating a new function template requires a couple of steps. While you could perform them all manually the fastest way for you to get started is to run:

```bash
npm run new-template
```

This script will prompt you for a couple of questions and set up a basic template that you can work from.

It will create a directory wiht the name you specified. In there you'll find a `functions/` directory with two functions. A `blank.js` file with the basic structure of a Twilio Function and a `hello-messaging.protected.js` that acts as a "protected" Function. Meaning once it's deployed it will not be accessible without a [valid `X-Twilio-Signature` header](https://www.twilio.com/docs/usage/webhooks/webhooks-security#validating-signatures-from-twilio). Protected Functions are best used to respond to Twilio webhooks.

### Adding external dependencies (npm)

If you want to use external dependencies in your template, add them to the `package.json` inside your template's directory. You'll also have to install the same dependency as a `devDependency` in the root of the project. For example if we want to add the `twilio-video` library in the `video-token` template we would run:

```bash
npm run add-dependency --template=video-token --package=twilio-video
```

### Adding environment variables

Any variable you want the user to have to set should be added to the `.env` file in your template directory and should include a commented line before that explaining what the variable is about. Example:

```bash
# description: The number you want your calls to be forwarded to
# required: true
# format: phone_number
MY_PHONE_NUMBER=
```

**Important**: You can find the format of the `.env` file and possible comments as part of [this Schema](https://github.com/twilio-labs/configure-env/blob/main/docs/SCHEMA.md).

They should also be mentioned in the existing table inside the `README.md` of your template directory.

### Updating the `index.html`

If your app has a front-end component to it, you can override the existing `index.html` file in your project.

In case your app does not contain a front-end component you should update the `index.html` file to reflect what steps a customer should perform to make the app work, once your template has been deployed.

### Testing the functionality of your new template locally

1. Make sure you have the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart) installed.

2. Enter the directory of your template. For example:

```bash
cd demo
```

3. Run the local development server:

```bash
twilio serverless:start
```

4. If you are using environment variables for your Function, make sure you [set them in your normal environment](https://www.twilio.com/blog/2017/01/how-to-set-environment-variables.html) and then run instead the command:

```bash
twilio serverless:start --load-local-env
```

## Running tests

The tests are written using [Jest](https://jestjs.io/). You can run the test suite by running:

```bash
npm test
```

If you are developing and want to run in watch mode, you can run either:

```bash
npm test -- --watch
```

or alternatively:

```bash
npx jest --watch
```

## Testing your template

If you want to test how your new template works with the Twilio CLI, make sure you have the latest version of [`@twilio-labs/plugin-serverless`](https://npm.im/@twilio-labs/plugin-serverless) installed.

Afterwards make sure you push your changes to a different branch or fork of the repository. Your changes have to be uploaded to GitHub for you to be able to test them.

For example if I'm working on the `verify` template, I might push my changes to a new branch called `update-verify` under my personal fork of the `function-templates` repository, located at: https://github.com/**dkundel/function-templates**.

In order to test if my changes are working, I can invoke the `twilio serverless:init` command with the following flags:

```bash
TWILIO_SERVERLESS_TEMPLATE_BRANCH="update-verify" \
TWILIO_SERVERLESS_TEMPLATE_REPO="dkundel/function-templates" \
twilio serverless:init example --template="verify"
```

## Creating a pull request

Please open a pull request on the [function-templates](https://github.com/twilio-labs/function-templates/pulls) repository from your fork and fill out the pull request template.

If you are adding a new template please name the pull request after the following convention and update `NAME_OF_YOUR_TEMPLATE` with the name of your template directory.

```
feat(templates): add NAME_OF_YOUR_TEMPLATE template
```

## Code of Conduct

We want to make sure that this project is as welcoming to people as possible. By interacting with the project in any shape or form you are agreeing to the project's [Code of Conduct](../CODE_OF_CONDUCT.md). If you feel like another individual has violated the code of conduct, please raise a complaint to [open-source@twilio.com](mailto:open-source@twilio.com).

## Licensing

All third party contributors acknowledge that any contributions they provide will be made under the same open source license that the open source project is provided under.

[serverless toolkit]: https://www.twilio.com/docs/labs/serverless-toolkit
