/* eslint-disable no-empty-function */
function createMockRequire(
  segmentSpy,
  webhookSpy,
  airtableOptInSpy,
  airtableRemoveOptInSpy
) {
  function Airtable() {
    this.base = () => {};
  }

  function Analytics() {}

  // eslint-disable-next-line consistent-return
  return function mockRequire(suppliedPath) {
    if (suppliedPath === './utils.private.js') {
      return {
        segmentOptIn: segmentSpy,
        webhookOptIn: webhookSpy,
        airtableCreateOptIn: airtableOptInSpy,
        airtableRemoveOptIn: airtableRemoveOptInSpy,
      };
    } else if (suppliedPath === 'airtable') {
      return Airtable;
    } else if (suppliedPath === 'analytics-node') {
      return Analytics;
    }
  };
}

module.exports = createMockRequire;
