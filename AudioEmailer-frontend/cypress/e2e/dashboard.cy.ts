describe('Dashboard', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login')
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('form').submit()
    cy.url().should('include', '/dashboard')
  })

  it('should display email list', () => {
    cy.get('[data-cy="email-list"]').should('exist')
    cy.get('[data-cy="email-preview"]').should('have.length.greaterThan', 0)
  })

  it('should show email details when clicked', () => {
    cy.get('[data-cy="email-preview"]').first().click()
    cy.get('[data-cy="email-description"]').should('be.visible')
  })

  it('should play audio for selected email', () => {
    cy.get('[data-cy="email-preview"]').first().click()
    cy.get('[data-cy="play-button"]').click()
    cy.get('[data-cy="audio-player"]').should('exist')
  })

  it('should navigate to settings', () => {
    cy.get('[data-cy="settings-button"]').click()
    cy.url().should('include', '/settings')
  })

  it('should connect email provider', () => {
    cy.get('[data-cy="gmail-button"]').should('exist')
    cy.get('[data-cy="outlook-button"]').should('exist')
    cy.get('[data-cy="gmail-button"]').click()
    cy.get('[data-cy="provider-connected"]').should('be.visible')
  })
})
