const origins = (context) => {
  const { DOMAIN_NAME } = context;
  const origins = [
          `https://${DOMAIN_NAME}`,
          'android:apk-key-hash:{base64_hash}',
        ];
  return origins;
};

module.exports = {
  origins
};
