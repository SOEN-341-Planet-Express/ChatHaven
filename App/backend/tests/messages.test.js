const request = require('supertest');
const app = require('../server');


//If we connect to the database during testing, we can purge it after we run our tests.
const mysql = require("mysql2");
const dbConfig = {
    host: "srvd12ed324fsd5t34r34.mysql.database.azure.com",
    user: "rtdsfasdf23r2eddva32",
    password: "kPnWV7@@m%",  
    database: "chathaven_DB",
    port: 3306,
    ssl: { rejectUnauthorized: true },
  };
  


describe('API tests for messages and channels', () => {
    let db;

    beforeAll(async () => {
        db = await mysql.createConnection(dbConfig);
    });

    afterAll(async () => {
        await db.end();
    });

    beforeEach(() => {
        
        jest.clearAllMocks();
    });

    afterEach(async () => {
        await db.execute("DELETE FROM users WHERE username = ?", [sample_username]);
        jest.resetAllMocks();
    });

    const sample_username = "test_username";
    const sample_password = "test_password";

    test('Gets available channels', async() => {
        const dummy = await request(app)
        .post('/register')
        .send({
            username: sample_username,
            password: sample_password
        })
        
        const test_user = ("SELECT FROM users where username = ?", [sample_username]);
        const response = await request(app)
        .post('/getChannels')
        .send({
            user: test_user,
        })

    expect(response.status).toBe(201)
    });
    
    test('Loads messages in a channel', async() => {
      const dummy = await request(app)
      .post('/register')
      .send({
          username: sample_username,
          password: sample_password
      })
      
      const test_user = ("SELECT FROM users where username = ?", [sample_username]);
      const response = await request(app)
      .post('/getChannels')
      .send({
          currentChannel: 'TEST3',  
          currentChannelType: 'groupchat',
          user: test_user,
      })

  expect(response.status).toBe(201)
  });
      
  test('Sends a message in a channel', async() => {
    const dummy = await request(app)
    .post('/register')
    .send({
        username: sample_username,
        password: sample_password
    })
    
    const test_user = ("SELECT FROM users where username = ?", [sample_username]);
    const response = await request(app)
    .post('/sendMessage')
    .send({
        messageToSend: 'Test Message',
        currentChannel: 'TEST3',  
        currentChannelType: 'groupchat',
        loggedInUser: test_user,
    })

  expect(response.status).toBe(200)
  expect(response.body).toHaveProperty('message', 'Message sent')

});
});
