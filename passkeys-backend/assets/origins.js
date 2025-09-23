const origins = (context) => {
  const { DOMAIN_NAME } = context;
  return [`https://${DOMAIN_NAME}`, 'android:apk-key-hash:{base64_hash}'];
};

module.exports = {
  origins,
};
