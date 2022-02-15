# Twilio Voice JavaScript SDK

This is a collection of functions that will setup a sample environment for use with the Programmable Voice SDKs. These are specifically for use with **client side** implementations. This also provides an example web application to explore the Twilio Voice JavaScript SDK.

## Configuration

```bash
twilio serverless:deploy
```

Visit your deployed application admin page: https://YOUR-TWILIO-DOMAIN.twil.io/admin/index.html

The default password is `default`

## Environment variables

This Function expects the following environment variables set:

| Variable     | Meaning                                                                           | Required |
| :----------- | :-------------------------------------------------------------------------------- | :------- |
| `APP_NAME`   | The name of this application                                                      | Yes      |
| `ADMIN_PASSWORD` | `/admin/index.html` is password protected, this is your password.             | Yes      |

## Development

In order to see your changes, you must deploy `twilio serverless:deploy`.

Variables set in [.env](./.env) will override environment variables set up in `/admin/index.html`

## Parameters

These functions don't expect any parameters passed.
