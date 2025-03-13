before(() => {
  cy.log('Starting all tests')
})


describe('Login Tests', () => {
  it('Allows a user to log in', () => {
    cy.visit('http://localhost:3000/Home')

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

  it('Allows a user create an account', () => {
    cy.visit('http://localhost:3000/Signup')
    const username = Math.random() * 1000
    const password = Math.random() * 1000
    
    cy.window().then((win) => {
      cy.spy(win, 'alert').as('alertSpy')
    })

    // Type into username and password fields
    cy.get('#username').type(username)
    cy.get('#password').type(password)
    cy.get('#confirmPassword').type(password)

    cy.get('button[type="submit"]').click()

    cy.get('@alertSpy').should('have.been.calledWith', 'Account Created!')
  })

  it('Allows a user to change their password', () => {

    cy.visit('http://localhost:3000/ForgotPassword')
    
    const new_password = Math.random() * 1000
    
    cy.get('#username').type("user_username")
    cy.get('#password').type(new_password)
    cy.get('#confirmPassword').type(new_password)

    cy.get('button[type="submit"]').click()

    cy.wait(1000)

    cy.get('#username').type("user_username")
    cy.get('#password').type(new_password)
    cy.get('button[type="submit"]').click()

    cy.wait(4000).window().then((win) => {
      expect(win.localStorage.getItem('loggedInUser')).to.equal('user_username')
    })
  })
})


describe('Admin Privileges Tests', () => {
  it('Creates a test channel', () => {
    cy.visit('http://localhost:3000/Home')

    // Type admin info into username and password fields
    cy.get('#username').type('thekillerturkey')
    cy.get('#password').type('supersafe')

    // Click login button
    cy.get('button[type="submit"]').click()
    cy.wait(4000)

   // cy.window().then((win) => {
    //  cy.spy(win, 'alert').as('alertSpy')
   // })

    cy.contains('button', 'Create').click()
    cy.get('input[data-testid="Channel-Name-Input"]').type('Test Channel')
    cy.get('button[data-testid="Channel-Name-Submit"]').click()

    cy.contains('li', 'Test Channel').should('be.visible');
  //  cy.get('@alertSpy').should('have.been.calledWith', 'Channel Created!')
  })
  it('Deletes a test channel', () => {
    cy.visit('http://localhost:3000/Home')

    // Type admin info into username and password fields
    cy.get('#username').type('thekillerturkey')
    cy.get('#password').type('supersafe')

    // Click login button
    cy.get('button[type="submit"]').click()
    cy.wait(4000)

    //cy.window().then((win) => {
    //  cy.spy(win, 'alert').as('alertSpy')
    //})

    cy.contains('button', 'Delete').click()
    cy.get('input[data-testid="Delete-Channel-Input"]').type('Test Channel')
    cy.get('button[data-testid="Delete-Channel-Submit"]').click()

    cy.contains('li', 'Test Channel').should('not.be.visible');

    //cy.get('@alertSpy').should('have.been.calledWith', 'Channel Deleted!')
  })
  it('Sends and deletes a message', () => {
    cy.visit('http://localhost:3000/Home')

    // Type admin info into username and password fields
    cy.get('#username').type('thekillerturkey')
    cy.get('#password').type('supersafe')

    // Click login button
    cy.get('button[type="submit"]').click()
    cy.wait(4000)

    // Remainder of this test to be written upon default channel creation (for ease of use)
  })
})