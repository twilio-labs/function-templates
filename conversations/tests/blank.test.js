const handler = require('../functions/blank').handler;

describe('conversations function template', () => {
  it('Calls callback with empty JSON', () => {
    const callback = jest.fn();
    handler({}, {}, callback);
    expect(callback).toHaveBeenCalledWith(null, {});
  });
});
