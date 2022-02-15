const cypress = require('cypress');

async function runTests(cypressConfig) {
  return cypress.run(cypressConfig);
}

module.exports = { runTests };
