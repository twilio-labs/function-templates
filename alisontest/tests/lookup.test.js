const lookupFunction = require("../functions/lookup").handler;
const helpers = require("../../test/test-helper");

const mockFetch = {
    fetch: jest.fn(() => Promise.resolve({ sid: "sid" })),
};

const mockClient = {
    lookups: {
        phoneNumbers: jest.fn(() => mockFetch),
    },
};

const testContext = {
    getTwilioClient: () => mockClient,
};

describe("international-telephone-input/lookup", () => {
    beforeAll(() => {
        helpers.setup({});
    });
    afterAll(() => {
        helpers.teardown();
    });

    test("returns an error response when required parameter is missing", (done) => {
        const callback = (err, result) => {
            expect(result).toBeDefined();
            expect(result._body.success).toEqual(false);
            done();
        };
        const event = {};
        lookupFunction(testContext, event, callback);
    });

    test("returns an error response when required parameter is empty", (done) => {
        const callback = (err, result) => {
            expect(result).toBeDefined();
            expect(result._body.success).toEqual(false);
            done();
        };
        const event = {
            phone: "",
        };
        lookupFunction(testContext, event, callback);
    });

    test("returns success with valid request", (done) => {
        const callback = (err, result) => {
            expect(result).toBeDefined();
            expect(result._body.success).toEqual(true);
            done();
        };
        const event = {
            phone: "+17341234567",
        };
        lookupFunction(testContext, event, callback);
    });
});
