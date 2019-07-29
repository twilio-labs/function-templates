const blank = require('../functions/blank').handler;

describe('blank function template', () => {
  it('Calls callback with empty JSON', () => {
    const callback = jest.fn();
    blank({}, {}, callback);
    expect(callback).toHaveBeenCalledWith(null, {});
  });
});
