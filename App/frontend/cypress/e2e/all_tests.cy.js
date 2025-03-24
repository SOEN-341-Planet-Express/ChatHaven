
const username = Math.random() * 1000
const password = Math.random() * 1000
const new_password = Math.random() * 1000


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

  it('Allows a user to create an account', () => {
    cy.visit('http://localhost:3000/Signup')

    // Type into username and password fields
    cy.get('#username').type(username)
    cy.get('#password').type(password)
    cy.get('#confirmPassword').type(password)

    cy.get('button[type="submit"]').click()


    cy.wait(1000)
          // Type into username and password fields
    cy.get('#username').type(username)
    cy.get('#password').type(password)

    // Click login button
    cy.get('button[type="submit"]').click()
    cy.wait(1000)
    
    cy.contains('h1', `Welcome ${username}`).should('be.visible')
  })


  it('Allows a user to change their password', () => {

    cy.visit('http://localhost:3000/ForgotPassword')
    

    
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

    cy.contains('button', 'Create').click()
    cy.get('input[data-testid="Channel-Name-Input"]').type('Test Channel')
    cy.get('button[data-testid="Channel-Name-Submit"]').click()

    cy.contains('li', 'Test Channel').should('be.visible');
  })
  it('Deletes a test channel', () => {
    cy.visit('http://localhost:3000/Home')

    // Type admin info into username and password fields
    cy.get('#username').type('thekillerturkey')
    cy.get('#password').type('supersafe')

    // Click login button
    cy.get('button[type="submit"]').click()
    cy.wait(4000)

    cy.contains('button', 'Delete').click()
    cy.get('input[data-testid="Delete-Channel-Input"]').type('Test Channel')
    cy.get('button[data-testid="Delete-Channel-Submit"]').click()

    cy.contains('li', 'Test Channel').should('not.exist');

  })

  it('Deletes an account', () => {
    cy.visit('http://localhost:3000/Home')

    // Type admin info into username and password fields
    cy.get('#username').type('thekillerturkey')
    cy.get('#password').type('supersafe')

    // Click login button
    cy.get('button[type="submit"]').click()
    cy.wait(4000)

    cy.get('button[test-userid="ellipsis"]').click();

    cy.get('button').contains("Delete a User").click()
    cy.get('input[placeholder = "User to delete"]').type(username)
    cy.get('button').contains("Delete User").click()

    cy.reload()

    cy.get('button').contains("Private").click()
    cy.get('button').contains(username).should("not.exist")

  })
})

describe('Message and Channel System Functionality Tests', () => {
  it('Sends and deletes a message', () => {
    cy.visit('http://localhost:3000/Home')

    // Type admin info into username and password fields
    cy.get('#username').type('thekillerturkey')
    cy.get('#password').type('supersafe')

    // Click login button
    cy.get('button[type="submit"]').click()
    cy.wait(4000)

    cy.get('li').contains('TEST3').click()

    cy.get('input[placeholder = "Type a message..."]').type('Test Message')
    cy.get('#messageField').click();


    cy.contains('p', 'Test Message')
    .should('be.visible')
    .parents('div')
    .find('button')
    .contains('❌')
    .click();

    cy.reload()

    cy.contains('p', 'Test Message').should('not.exist')
  })

  it('Changes the channel', () => {
    cy.visit('http://localhost:3000/Home')

    // Type admin info into username and password fields
    cy.get('#username').type('thekillerturkey')
    cy.get('#password').type('supersafe')

    // Click login button
    cy.get('button[type="submit"]').click()
    cy.wait(4000)

    cy.get('li').contains('TEST3').click()
    cy.contains('p', 'Test Message').should('exist')

    cy.get('li').contains('general').click()
    cy.contains('p', 'Test Message').should('not.exist')
    cy.contains('p', 'ad').should('exist')


  })

  it('Sends a DM', () => {
    cy.visit('http://localhost:3000/Home')

    // Type admin info into username and password fields
    cy.get('#username').type('thekillerturkey')
    cy.get('#password').type('supersafe')

    // Click login button
    cy.get('button[type="submit"]').click()
    cy.wait(4000)

    cy.get('button').contains("Private").click()

    cy.get('li').contains('admin').click()
    cy.get('input[placeholder = "Type a message..."]').type('Test Message')
    cy.get('#messageField').click();

    cy.get('button').contains("Logout").click()
    cy.get('input[placeholder = "Type a message..."]').should('not.exist')

    cy.get('#username').type('admin')
    cy.get('#password').type('admin')

    // Click login button
    cy.get('button[type="submit"]').click()
    cy.wait(4000)
    
    cy.get('button').contains("Private").click()

    cy.get('li').contains('thekillerturkey').click()
    cy.contains('p', 'Test Message').should('exist')

    cy.contains('p', 'Test Message')
    .parents('div')
    .find('button')
    .contains('❌')
    .click();

    cy.reload()

    cy.contains('p', 'Test Message').should('not.exist')
  })
})