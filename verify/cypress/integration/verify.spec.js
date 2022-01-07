/// <reference types="Cypress" />

// `verify` function template UI-only tests

const testNumber = "+18448144627";
const testEmail = "test@example.org";

describe("verify Template UI", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4040");
  });

  it("should identify itself as the Verify example", () => {
    cy.contains("Twilio Verify");
  });

  it("should accept a number to verify via SMS by default", () => {
    cy.get("[data-cy=input-phone]")
      .type(testNumber)
      .get("[data-cy=submit]")
      .click();

    // NOTE: This response will change when Cypress integration tests are incorporated
    cy.contains("Error");
  });

  it("should support verifying via a phone call", () => {
    cy.get("[data-cy=radio-call]")
      .click()
      .get("[data-cy=input-phone]")
      .type(testNumber)
      .get("[data-cy=submit]")
      .click();

    // NOTE: This response will change when Cypress integration tests are incorporated
    cy.contains("Error");
  });

  it("should support verifying via email", () => {
    cy.get("[data-cy=radio-email]")
      .click()
      .get("[data-cy=input-email]")
      .type(testEmail)
      .get("[data-cy=submit]")
      .click();

    // NOTE: This response will change when Cypress integration tests are incorporated
    cy.contains("Error");
  });

  it("should contain an EDIT_CODE tag and no APP_INFO", () => {
    const collectComments = (doc, contents) => {
      let commentWalker = doc.createTreeWalker(
        doc.body,
        NodeFilter.SHOW_COMMENT,
        {
          acceptNode: (node) =>
            node.nodeValue.trim() === contents
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT,
        },
        false
      );

      const comments = [];
      let currentNode;

      while ((currentNode = commentWalker.nextNode())) {
        comments.push(currentNode);
        currentNode = commentWalker.nextNode();
      }

      return comments;
    };

    cy.document().then((doc) => {
      expect(collectComments(doc, "EDIT_CODE").length).to.be.greaterThan(0);
      expect(collectComments(doc, "APP_INFO").length).to.equal(0);
    });
  });
});
