const RELATION = [
  'delegate_permission/common.handle_all_urls',
  'delegate_permission/common.get_login_creds',
];

exports.handler = function (context, event, callback) {
  const { DOMAIN_NAME, ANDROID_PACKAGE_NAME, ANDROID_SHA256_CERT_FINGERPRINT } =
    context;

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  const statements = [
    {
      relation: RELATION,
      target: { namespace: 'web', site: `https://${DOMAIN_NAME}` },
    },
  ];

  if (ANDROID_PACKAGE_NAME && ANDROID_SHA256_CERT_FINGERPRINT) {
    statements.push({
      relation: RELATION,
      target: {
        namespace: 'android_app',
        // eslint-disable-next-line camelcase
        package_name: ANDROID_PACKAGE_NAME,
        // eslint-disable-next-line camelcase
        sha256_cert_fingerprints: [ANDROID_SHA256_CERT_FINGERPRINT],
      },
    });
  }

  response.setBody(statements);

  return callback(null, response);
};
