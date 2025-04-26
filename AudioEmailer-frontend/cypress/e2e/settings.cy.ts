describe('Settings', () => {
  beforeEach(() => {
    // Login and navigate to settings
    cy.visit('/login')
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('form').submit()
    cy.get('[data-cy="settings-button"]').click()
    cy.url().should('include', '/settings')
  })

  it('should display user settings', () => {
    cy.get('[data-cy="settings-form"]').should('exist')
    cy.get('[data-cy="voice-settings"]').should('be.visible')
    cy.get('[data-cy="email-provider-settings"]').should('be.visible')
  })

  it('should update voice settings', () => {
    cy.get('[data-cy="voice-speed"]').clear().type('1.5')
    cy.get('[data-cy="voice-pitch"]').clear().type('1.2')
    cy.get('[data-cy="save-settings"]').click()
    cy.get('[data-cy="settings-saved"]').should('be.visible')
  })

  it('should manage email providers', () => {
    cy.get('[data-cy="connected-providers"]').should('exist')
    cy.get('[data-cy="disconnect-provider"]').should('exist')
    cy.get('[data-cy="disconnect-provider"]').first().click()
    cy.get('[data-cy="provider-disconnected"]').should('be.visible')
  })

  it('should test voice settings', () => {
    cy.get('[data-cy="test-voice"]').should('exist')
    cy.get('[data-cy="test-text"]').type('This is a test message')
    cy.get('[data-cy="test-voice"]').click()
    cy.get('[data-cy="audio-player"]').should('exist')
  })

  it('should save notification preferences', () => {
    cy.get('[data-cy="notification-settings"]').should('exist')
    cy.get('[data-cy="enable-notifications"]').click()
    cy.get('[data-cy="save-settings"]').click()
    cy.get('[data-cy="settings-saved"]').should('be.visible')
  })
})
