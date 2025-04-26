import users from '../fixtures/users.json';

describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('Should display login form', () => {
    cy.url().should('include', '/login')
    cy.get('form').should('exist')
  })

  it('Should show error on empty submission', () => {
    cy.get('form').submit();
    cy.url().should('include', '/login');
    cy.contains('Please enter both email and password.').should('be.visible');
  });

  it.skip('Should navigate to register page', () => {
    cy.contains('Register').click()
    cy.url().should('include', '/register')
  });

  it('Should show error on invalid login', () => {
    cy.get('input[type="email"]').type(users.invalidUser.email);
    cy.get('input[type="password"]').type(users.invalidUser.password);
    cy.get('form').submit();
    cy.contains('Invalid email or password').should('be.visible');
  });

  it.skip('Should redirect to dashboard on successful login', () => {
    cy.get('input[type="email"]').type(users.validUser.email);
    cy.get('input[type="password"]').type(users.validUser.password);
    cy.get('form').submit();
    cy.url().should('include', '/dashboard');
  });
})
