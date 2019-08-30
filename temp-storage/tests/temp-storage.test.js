const helpers = require('../../test/test-helper');
jest.mock('fs');
const temp_storage = require('../functions/temp-storage').handler;

const context = {};
const event = {};

let file_path = "/path/to/";
let filename = "test_file.txt";
let data = "Test data in the test file";

const MOCK_FILE_INFO = {
    '/path/to/test_file.txt': 'Sample data of the test file'
  };

beforeAll(() => {
  helpers.setup(context);
  require('fs').__setMockFiles(MOCK_FILE_INFO);
});

afterAll(() => {
  helpers.teardown();
});


test('returns a response that file was created with the file name', done => {
  const callback = (err, result) => {
    expect(result).toMatchObject("File created in temporary directory: test_file.txt");
    done();
  };

  temp_storage(context, event, callback);
});

test('returns an error when file creation or reading temp directory fails', done => {
  const callback = (err, result) => {
    expect(err).toBeInstanceOf(Error);
    done();
  };

  temp_storage(context, event, callback);
});
