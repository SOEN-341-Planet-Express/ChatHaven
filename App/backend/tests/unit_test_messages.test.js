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
  


describe('Unit tests for Message actions', () => {
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

    test('US.08 - Direct Messaging /getPrivateMessage', async() => {
        const dummy = await request(app)
        .post('/register')
        .send({
            username: sample_username,
            password: sample_password
        })
        
        const response = await request(app)
        .post('/getPrivateMessage')
        .send({
            user: sample_username
        });
        
    expect(response.status).toBe(200)
    });

    test('US.10 Message Sending /loadMessages', async() => {
        
        const response = await request(app)
        .post('/loadMessages')
        .send({
            currentChannel: 'TEST3',
            currentChannelType: 'groupchat', 
            loggedInUser: sample_username
        });
        
    expect(response.status).toBe(200)
    });

    test('US.10 - Message Sending /sendMessage', async() => {
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

    test('US.09 - Message Deletion', async() => {
            
        const response = await request(app)
        .post('/deleteMessage');
        
    expect(response.body).toHaveProperty('message', 'Message deleted')
    });
    });
