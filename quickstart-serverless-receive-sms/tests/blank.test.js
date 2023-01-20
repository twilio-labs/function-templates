const { handler } = require('../functions/blank');

describe('quickstart-serverless-receive-sms function template', () => {
  it('Calls callback with empty JSON', () => {
    const callback = jest.fn();
    handler({}, {}, callback);
    expect(callback).toHaveBeenCalledWith(null, {});
  });
});
