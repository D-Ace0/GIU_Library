describe('Admin Book Loan Approval Flow', () => {
  before(() => {
    // Log in as admin and set token in localStorage
    cy.request('POST', 'http://localhost:5000/auth/signin', {
      email: 'oijwh2004@gmail.com',
      password: '123456',
    }).then((res) => {
      const token = res.body.user.token;
      window.localStorage.setItem('token', token);
    });
  });

  it('approves a book loan and sees confirmation', () => {
    // Go to the request page
    cy.visit('http://localhost:3001/requests');

    // Click on the first "Approve" button
    cy.contains('Approve').first().click();

    // Wait for the modal and make sure the return date picker shows
    cy.contains('Set Return Date').should('be.visible');

    // Pick a return date 14 days from now
    const date = new Date();
    date.setDate(date.getDate() + 14);
    const returnDate = date.toISOString().split('T')[0];
    cy.get('input[type="date"]').clear().type(returnDate);

    // Click confirm
    cy.contains('Confirm Loan').click();

    // Assert toast notification appears
    cy.contains('Approved loan request', { timeout: 6000 }).should('be.visible');
  });
});
