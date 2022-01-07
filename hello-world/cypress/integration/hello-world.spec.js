describe('GET /hello-world', () => {
  it('returns valid hello world', () => {
    cy.request({
      method: 'GET',
      url: '/hello-world',
      headers: {},
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.body).to.eq('Hello world!');
    });
  });
});
