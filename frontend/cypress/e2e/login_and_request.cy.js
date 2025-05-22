describe('Sign In Page', () => {
  it('should log in successfully and redirect to /home', () => {
    // Visit the sign-in page
    cy.visit('http://localhost:3001'); // Adjust if different

    // Fill in the form
    cy.get('input#email').type('ahmedmouad0111@gmail.com');
    cy.get('input#password').type('123456');

    // Submit the form
    cy.get('form').submit();

    // Check URL changed (successful login)
    cy.url().should('include', 'http://localhost:3001/home');
  });

  it('should show an error on invalid credentials', () => {
    cy.visit('localhost:3001'); // Adjust if different

    cy.get('input#email').type('wrong@example.com');
    cy.get('input#password').type('wrongpass');

    cy.get('form').submit();

    // Check for error message
    cy.contains('Invalid username or password').should('exist');
  });
});
