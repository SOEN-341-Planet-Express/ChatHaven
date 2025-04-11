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
  


describe('API tests for Marketplace actions', () => {
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

    test('', async() => {
        
        const response = await request(app)
        .post('')
        .send({

        });
        
    expect(response.status).toBe()
    expect(response.body).toHaveProperty('message', '')
    });

});

