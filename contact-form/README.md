# Email contact form powered by SendGrid

This project shows you how to build a contact form powered by [the Twilio SendGrid email API](https://docs.sendgrid.com/api-reference/mail-send/mail-send).

You will need a SendGrid account and an [API key](https://app.sendgrid.com/settings/api_keys) to use this Function.

![An animation of the contact form. You fill in an email, subject and some content then submit. When it succeeds a green backed messages alerts you that your email is sent.](./contact-form.gif?raw=true)

## How to use the template

The best way to use the Function templates is through the Twilio CLI as described below. If you'd like to use the template without the Twilio CLI, [check out our usage docs](../docs/USING_FUNCTIONS.md).

### About domain authentication

When you send an email from SendGrid you should do so from either an email address that you have [verified as a single sender](https://docs.sendgrid.com/ui/sending-email/sender-verification) or from a [domain that you have authenticated with SendGrid](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication). Sending with emails like this means that SendGrid can verify that you control the email address. In the context of a contact form, even though you take the email address of the person submitting the form, the email will get sent from your email address. However, in this application, we set the submitter's email address as the `reply-to` address in the email, so that when you reply to the email it will go back to the submitter.

### Environment Variables

This project requires some environment variables to be set. To keep your API key secure, make sure not to commit the `.env` file to your source control. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

In your `.env` file, set the following variables:

| Variable             | Meaning                                                                                                                                                                                                                                                                                                                                             | Required |
| :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| `SENDGRID_API_KEY`   | Your SendGrid API key. If you don't have an API key, create one that has permission to send email in your [SendGrid account](https://app.sendgrid.com/settings/api_keys)                                                                                                                                                                            | Yes      |
| `TO_EMAIL_ADDRESS`   | When you submit the contact form, the function will send an email to this address                                                                                                                                                                                                                                                                   | Yes      |
| `FROM_EMAIL_ADDRESS` | This is the email address that emails will be sent from. Ensure that this email address is either [verified as a single sender](https://docs.sendgrid.com/ui/sending-email/sender-verification) or from a [domain that you have authenticated with SendGrid](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication) | Yes      |

### Function Parameters

`send-email.js` expects the following parameters:

| Parameter | Description                                          | Required |
| :-------- | :--------------------------------------------------- | :------- |
| `from`    | The submitter's email address, that we will reply to | Yes      |
| `subject` | The subject of the email                             |          |
| `content` | The content of the email                             | Yes      |

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```
twilio serverless:init my-contact-form --template=contact-form
cd my-contact-form
```

4. Add your environment variables to `.env`:

Make sure variables are populated in your `.env` file. See [Environment variables](#environment-variables).

5. Start the server :

```
npm start
```

1. Open the web page at https://localhost:3000/index.html and enter an email address, subject and some content. Submit the form and the email will be sent to the `TO_EMAIL_ADDRESS` you set in the `.env` file.

## Deploying

Deploy your functions and assets with the following commands. Note: you must run the command from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```