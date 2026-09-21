/*
 * Android reports its WebAuthn origin as the base64url encoded SHA-256 of the
 * app signing certificate. That is the same value as the colon separated
 * fingerprint published in assetlinks.json, just in a different encoding.
 */
const apkKeyHash = (fingerprint) =>
  Buffer.from(fingerprint.replace(/:/g, ''), 'hex').toString('base64url');

/*
 * iOS sends the associated domain itself as the origin, so a native iOS app is
 * covered by the `https://DOMAIN_NAME` entry.
 */
const origins = (context) => {
  const { DOMAIN_NAME, ANDROID_SHA256_CERT_FINGERPRINT } = context;
  const allowedOrigins = [`https://${DOMAIN_NAME}`];

  if (ANDROID_SHA256_CERT_FINGERPRINT) {
    allowedOrigins.push(
      `android:apk-key-hash:${apkKeyHash(ANDROID_SHA256_CERT_FINGERPRINT)}`
    );
  }

  return allowedOrigins;
};

module.exports = {
  origins,
  apkKeyHash,
};
