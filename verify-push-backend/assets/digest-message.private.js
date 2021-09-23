const crypto = require('crypto');

function digestMessage(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

module.exports = {
  digestMessage,
};
