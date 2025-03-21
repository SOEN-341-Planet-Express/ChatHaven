
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
  


describe('User API tests for user privilege system', () => {
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
    const sample_channel = "test_name";

    test('Check if non-admin user is admin', async() => {
        const dummy = await request(app)
        .post('/register')
        .send({
            username: sample_username,
            password: sample_password
        })
        
        const test_user = ("SELECT FROM users where username = ?", [sample_username]);
        const response = await request(app)
        .post('/checkadmin')
        .send({
            user: test_user
        })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('message', 'false')
    });

    test('Check if admin user is admin', async() => {
        const test_admin_user = ("SELECT FROM users where username = ?", ["thekillerturkey"])
        const response = await request(app)
        .post('/checkadmin')
        .send({
            user: test_admin_user
        })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('message', 'true')
    });

    test('Create a channel', async() => {
        const response = await request(app)
        .post('/createChannel')
        .send({
            channelName: sample_channel
        })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('message', 'Channel Created')
    });


    test('Delete a channel', async() => {
        const response = await request(app)
        .post('/deleteChannel')
        .send({
            channelName: sample_channel
        })

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('message', 'Channel Deleted')
    });

});

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
  


describe('API tests for user privilege system', () => {
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
    const sample_channel = "test_name";

    test('Check if non-admin user is admin', async() => {
        const dummy = await request(app)
        .post('/register')
        .send({
            username: sample_username,
            password: sample_password
        })
        
        const test_user = ("SELECT FROM users where username = ?", [sample_username]);
        const response = await request(app)
        .post('/checkadmin')
        .send({
            user: test_user
        })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('message', 'false')
    });

    test('Check if admin user is admin', async() => {
        const test_admin_user = ("SELECT FROM users where username = ?", ["thekillerturkey"])
        const response = await request(app)
        .post('/checkadmin')
        .send({
            user: test_admin_user
        })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('message', 'true')
    });

    test('Create a channel', async() => {
        const response = await request(app)
        .post('/createChannel')
        .send({
            channelName: sample_channel
        })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('message', 'Channel Created')
    });


    test('Delete a channel', async() => {
        const response = await request(app)
        .post('/deleteChannel')
        .send({
            channelName: sample_channel
        })

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('message', 'Channel Deleted')
    });

});

