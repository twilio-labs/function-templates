# mcp-server

Functions to run an MCP server for Twilio API tools

## Create a new project with the template

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)

Recommended method, homebrew:
```shell
brew tap twilio/brew && brew install twilio
twilio login
```

2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project

```shell
twilio serverless:init example --template=mcp-server && cd example
```

4. Set environment variables

This MCP server uses API keys to authenticate the Twilio API requests. A file named `.env` is used to store the values for those environment variables.

In your `.env` file, set the following values:

* API_KEY
* API_SECRET

ℹ️ You can generate a new API key in the [Twilio Console](https://www.twilio.com/console/project/api-keys)

5. Start the server with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```shell
twilio serverless:start
```

ℹ️ Check the developer console and terminal for any errors, make sure you've set your environment variables.

6. Test your local MCP server using the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)

```shell
npx @modelcontextprotocol/inspector
```

For local testing, use the following configuration:

* **Transport Type**: Streamable HTTP
* **URL**: http://localhost:{port}/mcp

ℹ️ When testing the protected /mcp endpoint locally, no authentication header is required.

## Deploying

Deploy your functions with the following command. Note: you must run this command from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```shell
twilio serverless:deploy
```

### Testing your MCP server

ℹ️ We're aware of a reported issue with the MCP Inspector project and the authentication header. You'll need to use your MCP client to connect to your deployed MCP server.

## Generatin Twilio Signature

Learn more about the use of `x-twilio-signature` header for executing `protected` Functions. https://www.twilio.com/docs/serverless/functions-assets/visibility#protected

The sample code below assuming that the following environment variables are set:
* TWILIO_AUTH_TOKEN
* TWILIO_BASE_DOMAIN

ℹ️ As the generated signature depends on the full Function endpoint that you are executing, and the URL includes the set of services (e.g. `/mcp?services=PhoneNumbers` vs `/mcp?services=Messaging`), you will need to generate a valid signature every time you update any part of the URL. We recommend dynamically generating the signature whenever you initialize the MCP client configuration with your Twilio MCP server.

### npx with [`twilio-signature-cli`](https://www.npmjs.com/package/twilio-signature-cli)

This CLI tool makes it easy to generate Twilio signatures for webhook validation without writing any code. It's perfect for testing and debugging Twilio webhook integrations, or for generating signatures in automated scripts.

```shell
npx twilio-signature-cli -t TWILIO_AUTH_TOKEN -u YOUR_FUNCTION_URL
```

### JavaScript

```javascript
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

function getSignature(authToken, url, params) {
  var data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url);

  return (
    crypto
      .createHmac("sha1", authToken)
      .update(Buffer.from(data, "utf-8"))
      .digest("base64")
  );
}

const signature =
  twilio.getExpectedTwilioSignature(
    process.env.TWILIO_AUTH_TOKEN,
    `${process.env.TWILIO_DOMAIN_NAME}/mcp?services=...`,
    {}
  );
```

or, with the [`twilio`](https://www.npmjs.com/package/twilio) Node package installed:

```javascript
const twilio = require("twilio");
const dotenv = require("dotenv");

dotenv.config();

const signature =
  twilio.getExpectedTwilioSignature(
    process.env.TWILIO_AUTH_TOKEN,
    `${process.env.TWILIO_DOMAIN_NAME}/mcp?services=...`,
    {}
  );
```

or, with the [`twilio-signature`](https://www.npmjs.com/package/twilio-signature) Node package installed, a lightweight alternative:

```javascript
import { createTwilioSignature } from 'twilio-signature';
const dotenv = require("dotenv");

dotenv.config();

const signature =
  createTwilioSignature(
    process.env.TWILIO_AUTH_TOKEN,
    `${process.env.TWILIO_DOMAIN_NAME}/mcp?services=...`,
    {}
  );
```

### Python

```python
import os
from dotenv import load_dotenv
from twilio.request_validator import RequestValidator

auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
base_domain = os.environ.get("TWILIO_DOMAIN_NAME")

url = f"{base_domain}/mcp?services=..."
validator = RequestValidator(auth_token)
signature = validator.compute_signature(url, {})
```

## Integration with MCP clients

* **URL**: `https://{functions-domain}.twil.io/mcp?services=`
* **Authentication Header**:
  * Key: `x-twilio-signature`
  * Value: {Valid Twilio signature}

### OpenAI Playground

You can use [OpenAI Playground](https://platform.openai.com/playground) to try out the Twilio MCP server.

1) Follow the instructions here to first deploy your MCP server.
2) Visit [OpenAI Playground](https://platform.openai.com/playground) and click on `Create` in front of Tools. Then select `MCP Server` from the dropdown menu. Then select `Add new`.
3) Paste the URL of Twilio Functions MCP Server from step 1) in the URL `https://{functions-domain}.twil.io/mcp`. Include any services you want in the query parameter.
4) For the `Authorization`, select `Custom headers`. For the header key, type in `x-twilio-signature`.
5) For the header value, open your terminal and type `npx twilio-signature-cli -t AUTH_TOKEN -u https://{functions-domain}.twil.io/mcp`. Copy the output and paste it in the header value
6) `Connect`

_NOTE_: You can filter different Twilio Services by using the query param `services` in the URL. For example `https://{functions-domain}.twil.io/mcp?services=Studio&services=PhoneNumbers` would give you `Studio` and `Phone Numbers` services. If you change this URL, remember to re-run the `npx twilio-signature-cli ...` with the updated URL (including the query params) to generate a new signature. For a list of all available services, visit [Twilio Functions](https://github.com/twilio-labs/function-templates/tree/main/mcp-server#filtering-tools-by-service).

### Javascript Code Sample

You can visit and clone https://github.com/twilio-samples/openai-mcp-samples/ for examples of how to use the MCP Server with OpenAI.

## Filtering tools by service

Use the querystring parameter `?services=` to specify a set of tools based on the needs of your MCP client. Set multiple services by passing multiple `services` key/value pairs.

**Examples:**

* `/mcp?services=Voice`
* `/mcp?services=Messaging&services=PhoneNumbers`

**Available services:**

* Messaging (default)
* Voice
* VoiceAddOns
* Conversations
* Studio
* TaskRouter
* Serverless
* Account
* PhoneNumbers
* Applications
* Auth
* AddOns
* Usage

## Example prompts

@TODO

## Security recommendations

This MCP server function will provide Tools to your LLM that provide access to your Twilio account. We recommend the following considerations when giving clients access to your server:

- Always set your MCP client to require tool approval to ensure that there are no unintended actions taken within your account.
- Use scoped permissions for your Twilio API Key. Not all endpoints support scoped permissions, but some do. See https://www.twilio.com/docs/iam/api-keys/restricted-api-keys for more information about which actions are supported per API Service.
- To ensure privacy, do not use other MCP servers in conjunction with your Twilio MCP server.
