const fs = require('fs');
const { JSDOM } = require('jsdom');

const AppHTML = fs.readFileSync(__dirname + '/../assets/index.html').toString();

describe('the app', () => {
  beforeEach(() => {
    jest.resetModules();

    const dom = new JSDOM(AppHTML);
    global.document = dom.window.document;
    global.window = dom.window;

    global.fetch = jest.fn();

    global.inputPrependBaseURL = () => {};
    global.handleCopyToClipboard = () => {};
  });

  it('should not display the passcode when an error is received from the /initialize endpoint', (done) => {
    fetch.mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ error: 'mock-error' }),
      })
    );

    // Load the app
    require('../assets/app');

    setImmediate(() => {
      expect(
        global.document.getElementById('token-server-passcode').value
      ).toBe('');

      expect(document.getElementById('passcode-generated').style.display).toBe(
        'none'
      );
      expect(
        document.getElementById('passcode-already-generated').style.display
      ).toBe('block');
      done();
    });
  });

  it('should display the passcode when it is received from the /initialize endpoint', (done) => {
    fetch.mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ passcode: 'mock-passcode' }),
      })
    );
    require('../assets/app');
    setImmediate(() => {
      expect(
        global.document.getElementById('token-server-passcode').value
      ).toBe('mock-passcode');

      expect(document.getElementById('passcode-generated').style.display).toBe(
        'block'
      );
      expect(
        document.getElementById('passcode-already-generated').style.display
      ).toBe('none');
      done();
    });
  });
});
