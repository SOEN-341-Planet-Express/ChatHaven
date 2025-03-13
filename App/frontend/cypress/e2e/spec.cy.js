describe('Login Test', () => {
  it('Allows a user to log in', () => {
    cy.visit('http://localhost:3000/Home')

    cy.get('#username').should('be.visible')
    cy.get('#password').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')

    // Type into username and password fields
    cy.get('#username').type('thekillerturkey')
    cy.get('#password').type('supersafe')


    

    // Click login button
    cy.get('button[type="submit"]').click()

    // Check if localStorage has stored the user
    cy.wait(4000).window().then((win) => {
      expect(win.localStorage.getItem('loggedInUser')).to.equal('thekillerturkey')
    })
  })
})
