const request = require('supertest');
const app = require('../server');

//If we connect to the database during testing, we can purge it after we run our tests.
const mysql = require("mysql2");
const dbConfig = {
    host: "srvd12ed324fsd5t34r34.mysql.database.azure.com",
    user: "rtdsfasdf23r2eddva32",
    password: "kPnWV7@@m%",  
    database: "chathaven_db_new",
    port: 3306,
    ssl: { rejectUnauthorized: true },
  };
  


describe('Unit tests for Channel actions', () => {
    let db;

    beforeAll(async () => {
        db = await mysql.createConnection(dbConfig);
    });

    afterAll(async () => {
        await db.execute("DELETE FROM users WHERE username = ?", [sample_username]);
        await db.end();
    });

    beforeEach(() => {
        
        jest.clearAllMocks();
    });

    afterEach(async () => {
        jest.resetAllMocks();
    });

    const sample_username = "tester_username";
    const sample_password = "test_password";
    const new_password = "new_password";

    test('US.05 - Create and Delete Channel /createChannel', async() => {
        
        const response = await request(app)
        .post('/createChannel')
        .send({
            channelName: 'UNIT_TEST_CHANNEL',
            loggedInUser: 'thekillerturkey'
        });
        
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('message', 'Channel Created')
    });

    test('US.05 - Create and Delete Channel /deleteChannel', async() => {
        
        const response = await request(app)
        .post('/deleteChannel')
        .send({
            currentChannel: 'UNIT_TEST_CHANNEL',
            });
        
        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('message', 'Channel Deleted')
    });

    test('US.07 - Channel Navigation /getChannels, ', async() => {
        
        const test_user = ("SELECT FROM users where username = ?", [sample_username]);
        const response = await request(app)
        .post('/getChannels')
        .send({
            user: 'thekillerturkey',
        })

    expect(response.status).toBe(201)
    });

    test('US.14 - Channel Access /getSentRequests', async() => {
        
        const response = await request(app)
        .post('/getSentRequests')
        .send({
            user: sample_username
        });
        
    expect(response.status).toBe(200)
    });

    test('US.14 - Channel Access /getReceivedRequests', async() => {
        
        const response = await request(app)
        .post('/getReceivedRequests')
        .send({
            user: sample_username
        });
        
    expect(response.status).toBe(200)
    });

    test('US.14 - Channel Access /getSentInvites', async() => {
        
        const response = await request(app)
        .post('/getSentInvites')
        .send({
            user: sample_username
        });
        
    expect(response.status).toBe(200)
    });

    test('US.14 - Channel Access /getReceivedInvites', async() => {
        
        const response = await request(app)
        .post('/getReceivedInvites')
        .send({
            user: sample_username
        });
        
    expect(response.status).toBe(200)
    });
});

