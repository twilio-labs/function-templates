/// <reference types="Cypress" />

// `verify` function template UI-only tests

const testNumber = "+18448144627";
const testEmail = "test@example.org";

describe('verify Template UI', () => {
    beforeEach(() => {
        cy.visit('/verify/index.html');
    });

    it('should identify itself as the Verify example', () => {
        cy.contains('Twilio Verify');
    });

    it('should accept a number to verify via SMS by default', () => {
        cy
            .get('[data-cy=input-phone]')
            .type(testNumber)
            .get('[data-cy=submit]')
            .click();

        // NOTE: This response will change when Cypress integration tests are incorporated
        cy.contains('Error');
    });

    it('should support verifying via a phone call', () => {
        cy
            .get('[data-cy=radio-call]')
            .click()
            .get('[data-cy=input-phone]')
            .type(testNumber)
            .get('[data-cy=submit]')
            .click();

        // NOTE: This response will change when Cypress integration tests are incorporated
        cy.contains('Error');
    });

    it('should support verifying via email', () => {
        cy
            .get('[data-cy=radio-email]')
            .click()
            .get('[data-cy=input-email]')
            .type(testEmail)
            .get('[data-cy=submit]')
            .click();

        // NOTE: This response will change when Cypress integration tests are incorporated
        cy.contains('Error');
    });
});
