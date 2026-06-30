const { redactVariable } = require('../functions/utils.private');

describe('#redactVariable', () => {
  it('replaces string with dots', () => {
    const result = redactVariable('hellothere');

    expect(result).toEqual('••••••••••');
  });
});
