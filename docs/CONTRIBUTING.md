# Contributing to Function Templates

## What are good ways to contribute?

We welcome any kind of contributions. From filing issues, to fixing typos and bugs all the way to creating entirely new templates.

Please be aware though that pull requests that only reword sentences that might already convey the content correctly, might not be merged.

If this is your first time contributing to an open-source project, [check out this resource](https://opensource.guide/how-to-contribute/).

## Requirements

- A GitHub account
- git installed on your computer. [Learn how to install it](https://help.github.com/en/articles/set-up-git)
- [Node.js](https://nodejs.org) version 14 and [npm](https://npmjs.com) version 8

## CodeExchange

Under the hood, every CodeExchange Quick Deploy app is powered by a Function Template.

See Quick Deploy apps here: [https://www.twilio.com/code-exchange?q=&f=serverless](https://www.twilio.com/code-exchange?q=&f=serverless)

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

## Building a template

[Check out the dedicated guide to building a new template][BUILD_TEMPLATE]

## Testing

[Check out the dedicated testing guide][TESTING]

## Shared Logic

### Github Pages

Several static assets shared by every `index.html` are served by Github Pages from the `/docs/static` directory of this repo. These files all follow [semver](https://semver.org/) versioning, and are located in a subdirectory of `/docs/static` named after their semver major version number. For example, a file of version `1.2.3` should have a comment header containing `Version: 1.2.3` (if possible), and be located in the `v1` subdirectory of `/docs/static`.

## Creating a pull request

Please open a pull request on the [function-templates](https://github.com/twilio-labs/function-templates/pulls) repository from your fork and fill out the pull request template.

If you are adding a new template please name the pull request after the following convention and update `NAME_OF_YOUR_TEMPLATE` with the name of your template directory.

```
feat(templates): add NAME_OF_YOUR_TEMPLATE template
```

## Code of Conduct

We want to make sure that this project is as welcoming to people as possible. By interacting with the project in any shape or form you are agreeing to the project's [Code of Conduct](https://raw.githubusercontent.com/twilio-labs/function-templates/main/CODE_OF_CONDUCT.md). If you feel like another individual has violated the code of conduct, please raise a complaint to [open-source@twilio.com](mailto:open-source@twilio.com).

## Licensing

All third party contributors acknowledge that any contributions they provide will be made under the same open source license that the open source project is provided under.

[serverless toolkit]: https://www.twilio.com/docs/labs/serverless-toolkit

<!-- RELATIVE LINKS -->
[TESTING]: ./TESTING.md
[CONTRIBUTING]: ./CONTRIBUTING.md
[BUILD_TEMPLATE]: ./BUILD_TEMPLATE.md
<!-- END RELATIVE LINKS -->
