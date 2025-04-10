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
  


describe('API tests for User actions', () => {
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

    test('US.02 - New Account /register', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                username: sample_username,
                password: sample_password
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Account Created');
    });

    test('US.01 - Login /login', async() => {
        
        const response = await request(app)
        .post('/login')
        .send({
            username: sample_username,
            password: sample_password
        });
        
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message', 'Login successful')
    });

    test('US.03 - Password Recovery /forgotpassword', async() => {

        const response = await request(app)
        .post('/forgotpassword')
        .send({
            username: sample_username,
            password: new_password
        })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message', 'Password changed successfully!')
    
    });

    test('US.16 - Last Seen Timestamp /updateStatus', async() => {
        
        const response = await request(app)
        .post('/updateStatus')
        .send({
            username: sample_username, 
            status: 'offline'
        });
        
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message', 'Status updated')
    });

    test('US.15 - User Status /getUserStatus', async() => {
        
        const response = await request(app)
        .post('/getUserStatus')
        .send({
            username: 'thekillerturkey'
        });
        
    expect(response.status).toBe(200)
    });
});

