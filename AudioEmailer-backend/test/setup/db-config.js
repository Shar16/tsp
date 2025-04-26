const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const { seedUsers } = require("./seed");
const dotenv = require("dotenv");

let mongod;

beforeAll(async () => {
    dotenv.config();

    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, {});
});

beforeEach(async () => {
    await seedUsers();
});

afterEach(async () => {
    await mongoose.connection.db.dropDatabase(); // Clear DB between tests
});

afterAll(async () => {
    if (mongod) {
        await mongoose.connection.close();
        await mongod.stop();
    }
});
