describe('TOTP with SMS fallback integration tests', () => {
  it('Should load the index page', () => {
    cy.visit('localhost:8000/index.html');
    cy.get('#status').should('be.empty');
    cy.get('#check-code').should('not.be.visible');

    cy.get('#name').type('Taylor');
    cy.get('[type="radio"]').check('whatsapp');
    cy.get('#phone_number').type('201-555-0123');

    cy.intercept('/send-otp', { ok: true });
    cy.get('[type="submit"]').first().click();
    cy.get('#status').should('be.visible');
    cy.get('#status').should('not.have.css', 'color', 'rgb(169, 68, 66)'); // error color

    cy.get('#check-code').should('be.visible');
    cy.get('#code').type('123456');
    cy.get('#check-code').submit();
    cy.get('#modal-status').should('have.css', 'color', 'rgb(169, 68, 66)');
    cy.get('#modal-status').contains('Incorrect token!');

    cy.intercept('/check-otp', { ok: true, message: 'Verification success.' });
    cy.get('#code').type('654321');
    cy.get('#check-code').submit();
    cy.url().should('be.eq', 'http://localhost:8000/totp-setup.html');
  });

  it('Should load the TOTP setup page', () => {
    const factorStub = {
      ok: true,
      factorSid: 'YFxxx',
      identity: 'identity',
      uri: 'factor.binding.uri',
      secret: 'factor.binding.secret',
      message: `Please scan the QR code in an authenticator app like Authy.`,
    };

    cy.visit('localhost:8000/totp-setup.html');
    cy.get('#canvas').should('not.be.visible');
    cy.get('#status').should('be.empty');

    cy.intercept('/create-factor', factorStub);
    cy.get('#create-factor').submit();
    cy.get('#canvas').should('be.visible');

    cy.intercept('/verify-new-factor', {
      ok: true,
      message: 'Factor verified.',
    });
    cy.get('#verify-new-factor').should('be.visible');
    cy.get('#verify-new-factor').type('1234').submit();
    cy.get('#status').contains('Factor setup complete!');
  });

  it('Should load the login page', () => {
    cy.window().then(() => {
      sessionStorage.setItem('to', '+12015550123');
      sessionStorage.setItem('channel', 'whatsapp');
    });
    cy.visit('localhost:8000/login.html');
    cy.get('#totp').should('be.visible');
    cy.get('#pn-otp').should('not.be.visible');

    cy.get('#session-data').contains(
      "Demo is running for username 'Taylor' with identity 'identity'."
    );

    cy.intercept('/send-otp', { ok: true });
    cy.get('#send-otp').within(() => {
      cy.get('[type="submit"]').first().click();
    });
    cy.get('#pn-otp').should('be.visible');
    cy.get('#totp').should('not.be.visible');

    cy.get('#show-totp').within(() => {
      cy.get('[type="submit"]').first().click();
    });
    cy.get('#pn-otp').should('not.be.visible');
    cy.get('#totp').should('be.visible');
  });

  it('Should reset the session', () => {
    cy.get('#session-data').contains(
      "Demo is running for username 'Taylor' with identity 'identity'."
    );
    cy.get('#session-reset').click();
    cy.get('#session-data').should('not.be.visible');
  });
});
