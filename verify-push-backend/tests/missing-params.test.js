const helpers = require('../../test/test-helper');
const missing = require('../assets/missing-params.private');

describe('verify-push-backend/private/missing-params', () => {
  beforeAll(() => {
    helpers.setup({});
  });
  afterAll(() => {
    helpers.teardown();
  });

  const { detectMissingParams } = missing;

  test('Detects multiple missing parameters when given a list', () => {
    const event = { baz: 'a' };
    const missing = detectMissingParams(['foo', 'bar', 'baz'], event);

    expect(missing).toEqual(['foo', 'bar']);
  });

  test('Detects no missing parameters when all are provided', () => {
    const event = { foo: 'a', bar: 'b', baz: 'c' };
    const missing = detectMissingParams(['foo', 'bar', 'baz'], event);

    expect(missing).toEqual([]);
  });

  test('Detects missing parameters when one is missing', () => {
    const event = { bar: 'b', baz: 'c' };
    const missing = detectMissingParams(['foo', 'bar', 'baz'], event);

    expect(missing).toEqual(['foo']);
  });

  test('Detects no missing parameters when none are expected', () => {
    const event = { bar: 'b', baz: 'c' };
    const missing = detectMissingParams([], event);

    expect(missing).toEqual([]);
  });
});
