const funlet = require('./funlet-simple-menu').handler;

test.skip('Missing Tests', done => {
  const callback = (err, result) => {
    expect(result).toBe('...');
    done();
  };
  funlet({}, {}, callback);
});
