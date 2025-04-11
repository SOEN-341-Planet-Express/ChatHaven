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
  


describe('API tests for Admin actions', () => {
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

    test('US.04 - Roles and Permissions /checkAdmin', async() => {
        
        const response = await request(app)
        .post('/checkAdmin')
        .send({
            user: 'admin'
        });
        
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('message', 'true')
    });

    test('US.06 - Add or Remove Users /assignUsers', async() => {

        const response = await request(app)
        .post('/assignUsers')
        .send({
            username: sample_username,
            channelName: 'TEST3'
        });
        
        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('message', 'User added to channel')
    });

    test('US.06 - Add or Remove Users /removeUsers', async() => {
        const response = await request(app)
        .post('/removeUsers')
        .send({
            username: sample_username,
            channelName: 'TEST3'
        });
        
        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('message', 'User removed from channel')
    });

});

