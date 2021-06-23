const context = {};
const event = {};
const mockFns = {};

jest.mock('fs', () => {
  return {
    writeFile: (path, content, callback) =>
      mockFns.writeFile(path, content, callback),
    readdir: (directoryPath, callback) =>
      mockFns.readdir(directoryPath, callback),
  };
});

test('returns a response that file was created with the file name', (done) => {
  mockFns.writeFile = (path, content, callback) => callback(null);
  mockFns.readdir = (directoryPath, callback) =>
    callback(null, ['test_file.txt']);

  const { handler } = require('../functions/temp-storage');
  const callback = (err, result) => {
    expect(err).toBe(null);
    expect(result).toMatch(
      'File created in temporary directory: test_file.txt'
    );
    done();
  };

  handler(context, event, callback);
});

test('returns an error when file creation fails', (done) => {
  mockFns.writeFile = (path, content, callback) =>
    callback(new Error('Write failed'));

  const { handler } = require('../functions/temp-storage');
  const callback = (err, result) => {
    expect(err).toBeInstanceOf(Error);
    done();
  };

  handler(context, event, callback);
});

test('returns an error when file read fails', (done) => {
  mockFns.writeFile = (path, content, callback) => callback(null);
  mockFns.readdir = (directoryPath, callback) =>
    callback(new Error('Read failed'));

  const { handler } = require('../functions/temp-storage');
  const callback = (err, result) => {
    expect(err).toBeInstanceOf(Error);
    done();
  };

  handler(context, event, callback);
});
