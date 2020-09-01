# video

Basic 1:1 video chat application. [Check out this blog post for a walkthrough of the app](https://www.twilio.com/blog/build-a-video-app-javascript-twilio-cli-quickly).

## Pre-requisites

### Environment variables

This project requires some environment variables to be set. To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following values:

| Variable     | Description                                                                       | Required |
| :----------- | :-------------------------------------------------------------------------------- | :------- |
| `API_KEY`    | Twilio API Key. Create one here (https://www.twilio.com/console/runtime/api-keys) | Yes      |
| `API_SECRET` | Twilio API Secret corresponding to your API Key                                   | Yes      |
| `PASSCODE`   | A passcode to gate your video call                                                | Yes      |

### Function Parameters

`/video-token` expects the following parameters:

| Parameter | Description                                  | Required |
| :-------- | :------------------------------------------- | :------- |
| passcode  | The passcode the user entered on the website | Yes      |

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init example --template=video && cd example
```

4. Start the server with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:start
```

5. Open the web page at https://localhost:3000/index.html to test the app

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

## Deploying

Deploy your functions and assets with either of the following commands. Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```
