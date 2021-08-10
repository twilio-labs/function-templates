const sinon = require('sinon');

const segmentOptIn = sinon.spy(() => {
  console.log('spy');
});
const webhookOptIn = sinon.spy(() => {
  console.log('spy');
});
const airtableCreateOptIn = sinon.spy(() => {
  console.log('spy');
});
const airtableRemoveOptIn = sinon.spy(() => {
  console.log('spy');
});

module.exports = {
  segmentOptIn,
  webhookOptIn,
  airtableCreateOptIn,
  airtableRemoveOptIn,
};
