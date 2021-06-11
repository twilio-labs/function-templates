const helpers = require('../../test/test-helper');
// const checkExistingFlow = require('../functions/check-existing-flow').handler;
const auth = require('../functions/auth.private').handler;
const returnConfig = require('../functions/return-config').handler;
const detectIntent = require('../functions/es-dialogflow-detect-intent').handler;
const {SessionsClient} = require('@google-cloud/dialogflow');

jest.mock('@google-cloud/dialogflow')
SessionsClient.mockImplementation(() => {
  return {
    projectAgentSessionPath: (a, b) => null,
    detectIntent: (a) => {
      return [{
        queryResult: {
          session_id: "session_id"
        }
      }];
    }
  };
});

const context = { 
    TWILIO_PHONE_NUMBER: "+12345678910",
    FLOW_SID: "",
    DIALOGFLOW_ES_PROJECT_ID: "project-id",
    GOOGLE_APPLICATION_CREDENTIALS: "/service-account-key.json",
    DOMAIN_NAME: "localhost"
};

const event = {};

beforeAll(() => {
  const runtime = new helpers.MockRuntime();
  runtime._addAsset('/service-account-key.json', './service-account-key.test.json');
  helpers.setup(context, runtime);
});

afterAll(() => {
  helpers.teardown();
});


describe('return-config', () => {
  it('should return environment phone number as config body', (done) => {
  const phone_number = context.TWILIO_PHONE_NUMBER;
    const callback = (err, res) => {
      expect(err).toBeFalsy();
      expect(res._statusCode).toBe(200);
      expect(res._headers['Content-Type']).toMatch('application/json');
      expect(res._body.phone_number).toMatch(phone_number);
      done();
    };

    returnConfig(context, event, callback);
  });
});


describe('es-dialogflow-detect-intent', () => {
  it('it should detect intent', (done) => {
    const localEvent = { utterance: "Hi" };

    const callback = (err, res) => {
      expect(res).toBeTruthy;
    }

    detectIntent(context, localEvent, callback);
    done();
  });

  it('should assign dialogflow session id if missing', (done) => {
    
    const localEvent = { utterance: "Hi" };

    const callback = (err, res) => {
      console.log(res);
      expect(localEvent.dialogflow_session_id).toMatch(res.session_id)
    }

    detectIntent(context, localEvent, callback);
    expect(localEvent.dialogflow_session_id).toBeTruthy();

    done()
  });

  it('should not assign dialogflow session id if present', (done) => {
    
    const localEvent = { utterance: "Hi", dialogflow_session_id: "sessionid" };

    const callback = (err, res) => {
      console.log(res);
      expect(res.session_id).toMatch("sessionid")
    }

    detectIntent(context, localEvent, callback);
    expect(localEvent.dialogflow_session_id).toMatch("sessionid");
    done();
  });
});