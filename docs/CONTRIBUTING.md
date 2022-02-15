# Contributing to Function Templates

## What are good ways to contribute?

We welcome any kind of contributions. From filing issues, to fixing typos and bugs all the way to creating entirely new templates.

Please be aware though that pull requests that only reword sentences that might already convey the content correctly, might not be merged.

If this is your first time contributing to an open-source project, [check out our TwilioQuest tutorial](https://www.twilio.com/quest/learn/open-source) that will teach you in a fun way how to contribute to a project.

## Requirements

- A GitHub account
- git installed on your computer. [Learn how to install it](https://help.github.com/en/articles/set-up-git)
- [Node.js](https://nodejs.org) and a package manager like [npm](https://npmjs.com)

## CodeExchange

Under the hood, every CodeExchange Quick Deploy app is powered by a Function Template.

See Quick Deploy apps here: https://www.twilio.com/code-exchange?q=&f=serverless

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

It will create a directory with the name you specified. In there you'll find a `functions/` directory with two functions. A `blank.js` file with the basic structure of a Twilio Function and a `hello-messaging.protected.js` that acts as a "protected" Function. Meaning once it's deployed it will not be accessible without a [valid `X-Twilio-Signature` header](https://www.twilio.com/docs/usage/webhooks/webhooks-security#validating-signatures-from-twilio). Protected Functions are best used to respond to Twilio webhooks.

### Using the runtime-helpers library

One of the default dependencies for new function templates is the `runtime-helpers` library, which is a Twilio project that provides easy-to-use, tested implementations of various common Function building blocks and utlities. We recommend using the shared `runtime-helpers` version of a feature whenever it exists. Full documentation for the `runtime-helpers` API and feature set is available in [this reference](https://twilio-labs.github.io/runtime-helpers/).

### Adding external dependencies (npm)

If you want to use external dependencies in your template, add them to the `package.json` inside your template's directory. You'll also have to install the same dependency as a `devDependency` in the root of the project. For example if we want to add the `twilio-video` library in the `video-token` template we would run:

```bash
npm run add-dependency --template=video-token --package=twilio-video
```

### Adding environment variables

Function templates can use environment variables for deploy-specific secrets by adding them to the `.env` file in the root of your template. These are the fields that the user will be able to pre-set on the CodeExchange web app. `Step 2` visually shows the env vars that are set in `.env`: https://www.twilio.com/code-exchange/simple-sms-forwarding

Any variable you want the user to have to set should be added to the `.env.example` file in your template directory and should include a commented line before that explaining what the variable is about. Example:

```bash
# description: The number you want your calls to be forwarded to
# required: true
# format: phone_number
MY_PHONE_NUMBER=
```

**Important**: You can find the format of the `.env.example` file and possible comments as part of [this Schema](https://github.com/twilio-labs/configure-env/blob/main/docs/SCHEMA.md).

They should also be mentioned in the existing table inside the `README.md` of your template directory.

If you _do not_ want an environment variable to appear on the CodeExchange page, set `configurable: false` for that variable.

**Note**: All function templates are checked for the presence of a `.env.example` or a `.env` file by `npm test`. If a test named `should have a .env.example (or .env) file` fails, ensure that your function template's `.env` file exists and `git add` has been used to add it to your commit. If your function template lacks environment variables, commit an empty `.env` file. If the test is failing due to a directory that is not a function template, add that directory to the `excludedPaths` variable in `test/all-templates.test.js`.

### Updating the `index.html`

If your app has a front-end component to it, you can override the existing `index.html` file in your project.

In case your app does not contain a front-end component you should update the `index.html` file to reflect what steps a customer should perform to make the app work, once your template has been deployed.

### Adding yourself to `.owners`

Each app has a `.owners` file in its root directory. This file is a list of Github usernames that will be assigned as reviewers on any PR that involves changes to that app. Add your Github username to the bottom of this file, replacing the comment `# Insert your Github username here`.

### Versioning and `CHANGELOG.md`

Every Quick Deploy app has a version field in its `package.json` that follows [semantic versioning](https://semver.org/), and a `CHANGELOG.md` file that uses the [keep a changelog](https://keepachangelog.com/en/1.0.0/) format. Initially your app will be at version 1.0.0. If you are updating an app that has already been published to Code Exchange, please increment its version number according to the semantic versioning specification, and update its changelog with the changes you have made to the app since its last version. Versioning your app before it gets deployed by users will help isolate issues in a particular version of the app, and will also enable your app to take advantage of a future update mechanism for deployed apps.

## Testing

### Manually testing the functionality of your new template locally

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

### Running automated unit tests

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

### E2E tests using Cypress

#### Creating your first tests

1. Add an `e2e.js` file to your template with the following content:

```js
const { runE2eTestSuite } = require("../_helpers/test-suite");

runE2eTestSuite({
  env: {
    // put any environment variables for Twilio Functions here
  }
})
```

You can use the object to also define custom Cypress configuration options.

2. Create a directory `cypress/integration` inside your template directory and add your Cypress test files there.

3. In the `package.json` of your template add the following:

```diff
{
  "version": "1.0.0",
  "private": true,
- "dependencies": {}
+ "dependencies": {},
+ "scripts": {
+   "e2e": "node e2e.js"
+ }
}
```

4. In the project root `package.json` add your template name to the `workspaces` array. For example:

```diff
  "workspaces": [
    "hello-world",
+   "my-template"
  ]
}
```

#### Running your E2E test suite

If you only want to run your own template, in the template directory run `npm run e2e`.

To run all E2E test suites, run in the root `npm run e2e`. This might take a while.

#### Fix any repository verification test failures

The majority of the test failures you will see from an `npm test` run will be in the unit tests you have written for your app. Occasionally, you may see a failure that originates in `all-templates.test.js`, which contains a suite of verifications that run against the entire `function-templates` codebase and help ensure that your code will successfully deploy once merged into the repository. Common failure cases for this test suite are:

- An app has a missing or poorly-formed entry in `templates.json`. Usually this is the result of modifying the `templates.json` file by hand. Compare the failing app's entry in `templates.json` against an entry for an app that passes and ensure all fields are present, and that all field names and the app's ID are correctly spelled. A syntax error parsing `templates.json` can also cause a failure here; use a verification tool to track down any syntax issues that may exist in the file.

- Your app's `package.json` file has dependencies that are not in the `function-templates` repository root `package.json`. Usually this is the result of adding dependencies by hand instead of using the `npm run add-dependency` script recommended in this document. To fix this, either use `npm run add-dependency` or edit the repository root `package.json` to contain the correct dependency for your app.

- Your app does not have one unit test file per Function. We encourage thorough testing for all of our apps, and generally prefer each JavaScript file in the `functions` directory to have a matching test file in the `tests` directory. This may not be ideal for the structure of every app; if your app is thoroughly tested but fails this verification, it may make sense to add its ID to the `incompleteTests` variable in `test/all-templates.test.js` so that it skips this verification. This test also only applies to files in the top level of the `functions` directory, so placing any JavaScript files that fail verification in a subdirectory of `functions` will also skip this test for those files.

### Deploy and test to a hosted Twilio serverless environment

1. Create a profile/api key, if you don't already have one

```
twilio login
```

2. List existing profiles

```
twilio profiles:list
```

2. Activate the profile

```
twilio profiles:use <your_profile_id>
```

3. Deploy

```
twilio serverless:deploy
```

### Test the installation of your template

If you want to test how your new template works with the Twilio CLI, make sure you have the latest version of [`@twilio-labs/plugin-serverless`](https://npm.im/@twilio-labs/plugin-serverless) installed.

Afterwards make sure you push your changes to a different branch or fork of the repository. Your changes have to be uploaded to GitHub for you to be able to test them.

For example if I'm working on the `verify` template, I might push my changes to a new branch called `update-verify` under my personal fork of the `function-templates` repository, located at: https://github.com/dkundel/function-templates.

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
