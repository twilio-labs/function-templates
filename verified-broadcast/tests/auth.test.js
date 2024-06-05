const { isAuthenticated } = require('../assets/auth.private');

const getAuthedEvent = (username, password) => ({
  request: {
    headers: {
      // eslint-disable-next-line sonarjs/no-nested-template-literals
      authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
        'base64'
      )}`,
    },
  },
});

const PASSCODE = 'test-super-secret-password';

describe('verified-broadcast/auth', () => {
  test('should pass with valid credentials', () => {
    expect(
      isAuthenticated(
        { PASSCODE },
        getAuthedEvent('admin', 'test-super-secret-password')
      )
    ).toBeTruthy();
  });

  test('should fail with invalid password', () => {
    expect(
      isAuthenticated(
        { PASSCODE },
        getAuthedEvent('admin', 'not-your-password')
      )
    ).toBeFalsy();
  });

  test('should fail with invalid username', () => {
    expect(
      isAuthenticated(
        { PASSCODE },
        getAuthedEvent('droid', 'test-super-secret-password')
      )
    ).toBeFalsy();
  });

  test('should fail with no auth header', () => {
    expect(isAuthenticated({ PASSCODE }, {})).toBeFalsy();
  });

  test('should fail with invalid auth header', () => {
    expect(
      isAuthenticated(
        { PASSCODE },
        {
          request: { headers: { authorization: 'Bearer 1234' } },
        }
      )
    ).toBeFalsy();
  });
});
