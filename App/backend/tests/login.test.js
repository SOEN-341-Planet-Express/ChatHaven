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
  


describe('User API tests for Login page', () => {
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

    const sample_username = Math.random() * 1000;
    const sample_password = Math.random() * 1000;

    test('Create a new user given user credentials', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                username: sample_username,
                password: sample_password
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Account Created');
    });

    test('Login to an existing account', async() => {
        
        const response = await request(app)
        .post('/login')
        .send({
            username: sample_username,
            password: sample_password
        });
        
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message', 'Login successful')
    });

/*    test('Recover a password', async() => {
        const new_password = Math.random() * 1000
        //create dummy account to mess with. will be purged after testing
        const dummy = await request(app)
        .post('/register').send({
            username: sample_username,
            password: sample_password
        });

        const response = await request(app)
        .post('/forgotpassword')
        .send({
            username: sample_username,
            password: new_password
        })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message', 'Password changed successfully!')
    });
*/
});
