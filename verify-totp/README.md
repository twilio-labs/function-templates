# Twilio Verify Time-based One-time passwords (TOTP)

This demo of the [Twilio Verify API](https://www.twilio.com/docs/verify/api) includes the TOTP factor type for supporting authenticator apps like Authy or Google Authenticator.

**Verify TOTP is in Pilot, which means that you'll need to [contact sales to request access to the API](https://www.twilio.com/help/sales). We expect to have Verify TOTP in Public Beta (at which point the API will be availble for self service) by the end of 2021.**

## Pre-requisites

* A Verify Service. [Create one in the Twilio Console](https://www.twilio.com/console/verify/services)

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable             | Meaning                                                           | Required |
| :------------------- | :---------------------------------------------------------------- | :------- |
| `ACCOUNT_SID`        | Find in the [console](https://www.twilio.com/console)             | Yes      |
| `AUTH_TOKEN`         | Find in the [console](https://www.twilio.com/console)             | Yes      |
| `VERIFY_SERVICE_SID` | Create one [here](https://www.twilio.com/console/verify/services) | Yes      |

### Additional dependencies

This project uses the [npm package `qrcode`](https://www.npmjs.com/package/qrcode#browser) for rendering the TOTP URI in a QR Code. The precompiled bundle for `qrcode` is included in the assets folder.

### Function Parameters

`create-factor.js` expects the following parameters:

| Parameter      | Description                                 | Required |
| :------------- | :------------------------------------------ | :------- |
| `name`         | An identifier that is used in the authenticator app account name. | Yes |

`verify-new-factor.js` expects the following parameters:

| Parameter           | Description                | Required |
| :------------------ | :------------------------- | :------- |
| `identity`          | Unique identity UUID. Returned from `create-factor` function. | Yes |
| `factorSid`         | Starts with `YF`. Returned from `create-factor` function. | Yes |
| `code`              | Collected from user input. | Yes |

`verify-new-factor` will also return backup codes in the response.

`create-challenge.js` expects the following parameters:

| Parameter           | Description                | Required |
| :------------------ | :------------------------- | :------- |
| `identity`          | Unique identity UUID. Returned from `create-factor` function. | Yes |
| `factorSid`         | Starts with `YF`. Returned from `create-factor` function. | Yes |
| `code`              | Collected from user input. | Yes |


## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init totp-sample-app --template=verify-totp && cd totp-sample-app
```

4. Add your environment variables to `.env`:

Make sure variables are populated in your `.env` file. See [Environment variables](#environment-variables).

5. Start the server :

```
twilio serverless:start
```

5. Open the web page at https://localhost:3000/index.html and enter your phone number to test

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```
