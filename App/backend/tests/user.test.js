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
  


describe('API tests for user account actions ', () => {
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

    test('Assigns user to test channel', async() => {
        const dummy = await request(app)
        .post('/register')
        .send({
            username: sample_username,
            password: sample_password
        })
        
        const test_user = ("SELECT FROM users where username = ?", [sample_username]);
        const response = await request(app)
        .post('/assignUsers')
        .send({
            user: test_user,
            channelName: "TEST3"
        })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('message', 'User added to channel')
    });

    test('Remove user from channel', async() => {
        const dummy = await request(app)
        .post('/register')
        .send({
            username: sample_username,
            password: sample_password
        })
        
        const test_user = ("SELECT FROM users where username = ?", [sample_username]);
        const add_user = await request(app)
        .post('/assignUsers')
        .send({
            user: test_user,
            channelName: "TEST3"
        })

        const response = await request(app)
        .post('/removeUsers')
        .send({
            user: test_user,
            channelName: "TEST3"
        })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('message', 'User removed from channel')
    });

    test('Gets private messages', async() => {
        const dummy = await request(app)
        .post('/register')
        .send({
            username: sample_username,
            password: sample_password
        })
        
        const test_user = ("SELECT FROM users where username = ?", [sample_username]);
        const response = await request(app)
        .post('/getPrivateMessage')
        .send({
            user: test_user,
        })

    expect(response.status).toBe(200)
    });

    test('Deletes a user', async() => {
        const dummy = await request(app)
        .post('/register')
        .send({
            username: sample_username,
            password: sample_password
        })
        
        const response = await request(app)
        .post('/deleteUser')
        .send({
            username: sample_username,
        })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message', 'User deleted successfully!')
    });
});
