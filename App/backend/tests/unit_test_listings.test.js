const request = require('supertest');
const app = require('../server');
const path = require("path");


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
    let listingId;


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

    test('US.19 - Create Listing /listings (with upload)', async() => {
        
        const response = await request(app)
        .post('/listings')
        .field("title", "TEST_LISTING")
        .field("description", "TEST_DESCRIPTION")
        .field("price", "99.99")
        .field("author", sample_username)
        .attach("image", path.resolve(__dirname, "test-image.jpg"));
      
        
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('message', 'Created')

    //Save this to get it for future unit tests
    listingId = response.body.listingId;
    });

    test('US.22 - Sold Listing /listings/:id/toggle-status', async() => {
        
        const response = await request(app)
        .put(`/listings/${listingId}/toggle-status`)
        
    expect(response.status).toBe(200)
    });

    test('US.23 - View Listings /listings', async() => {
        
        const response = await request(app)
        .get('/listings')        
    expect(response.status).toBe(200)
    });

    test('US.21 - Delete Listing /listings/:id', async() => {
        
        const response = await request(app)
        .delete(`/listings/${listingId}`)
        
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message', 'Listing deleted')
    });
});

