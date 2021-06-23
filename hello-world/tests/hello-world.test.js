const helloWorld = require('../functions/hello-world').handler;

test('returns the string "Hello world!"', (done) => {
  const callback = (_err, result) => {
    expect(result).toBe('Hello world!');
    done();
  };
  helloWorld({}, {}, callback);
});
