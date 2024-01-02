# Testing Templates

## Manually testing the functionality of your new template locally

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

## Running automated unit tests

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

## E2E tests using Cypress

_See an example in the `/verify-totp-sms` template._

### Creating your first tests

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

### Running your E2E test suite

If you only want to run your own template, in the template directory run `npm run e2e`.

To run all E2E test suites, run in the root `npm run e2e`. This might take a while.

### Fix any repository verification test failures

The majority of the test failures you will see from an `npm test` run will be in the unit tests you have written for your app. Occasionally, you may see a failure that originates in `all-templates.test.js`, which contains a suite of verifications that run against the entire `function-templates` codebase and help ensure that your code will successfully deploy once merged into the repository. Common failure cases for this test suite are:

- An app has a missing or poorly-formed entry in `templates.json`. Usually this is the result of modifying the `templates.json` file by hand. Compare the failing app's entry in `templates.json` against an entry for an app that passes and ensure all fields are present, and that all field names and the app's ID are correctly spelled. A syntax error parsing `templates.json` can also cause a failure here; use a verification tool to track down any syntax issues that may exist in the file.

- Your app's `package.json` file has dependencies that are not in the `function-templates` repository root `package.json`. Usually this is the result of adding dependencies by hand instead of using the `npm run add-dependency` script recommended in this document. To fix this, either use `npm run add-dependency` or edit the repository root `package.json` to contain the correct dependency for your app.

- Your app does not have one unit test file per Function. We encourage thorough testing for all of our apps, and generally prefer each JavaScript file in the `functions` directory to have a matching test file in the `tests` directory. This may not be ideal for the structure of every app; if your app is thoroughly tested but fails this verification, it may make sense to add its ID to the `incompleteTests` variable in `test/all-templates.test.js` so that it skips this verification. This test also only applies to files in the top level of the `functions` directory, so placing any JavaScript files that fail verification in a subdirectory of `functions` will also skip this test for those files.

## Deploy and test to a hosted Twilio serverless environment

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

## Test the installation of your template

If you want to test how your new template works with the Twilio CLI, make sure you have the latest version of [`@twilio-labs/plugin-serverless`](https://npm.im/@twilio-labs/plugin-serverless) installed.

Afterwards make sure you push your changes to a different branch or fork of the repository. Your changes have to be uploaded to GitHub for you to be able to test them.

For example if I'm working on the `verify` template, I might push my changes to a new branch called `update-verify` under my personal fork of the `function-templates` repository, located at: [https://github.com/dkundel/function-templates](https://github.com/dkundel/function-templates).

In order to test if my changes are working, I can invoke the `twilio serverless:init` command with the following flags:

```bash
TWILIO_SERVERLESS_TEMPLATE_BRANCH="update-verify" \
TWILIO_SERVERLESS_TEMPLATE_REPO="dkundel/function-templates" \
twilio serverless:init example --template="verify"
```
