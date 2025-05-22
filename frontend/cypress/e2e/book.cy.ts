describe('Book Request with Auto Login', () => {
  before(() => {
    // Call your backend login endpoint directly
    cy.request({
      method: 'POST',
      url: 'http://localhost:5000/auth/signin',
      body: {
        email: 'ahmedmouad0111@gmail.com',
        password: '123456',
      },
    }).then((response) => {
      const token = response.body.user.token;
      // Save token in localStorage before the app loads
      window.localStorage.setItem('token', token);
    });
  });

  it('should request a book successfully', () => {
    // Visit book-search after login
    cy.visit('http://localhost:3001/book-search');

    // Wait for the book to be rendered
    cy.contains('Dragon book', { timeout: 10000 }).click();

    // Ensure modal is visible
    cy.contains('Book Summary').should('be.visible');

    // Stub alert
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alert');
    });

    // Click Request
    cy.contains('button', 'Request').click();

    // Assert alert was called
    cy.get('@alert').should('have.been.calledWithMatch', /successfully/i);

    // Optionally check “Requested” state
    cy.contains('Requested').should('be.visible');
  });
});
