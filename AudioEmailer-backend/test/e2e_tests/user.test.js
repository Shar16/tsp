const request = require("supertest");
const app = require("../../src/index");
const { UsersModel } = require("../../src/models/users.model");

describe("[E2E] /api/users", () => {
    describe("POST /api/users/register", () => {
        it("should register a user with valid data", async () => {
            const user = {
                name: "Bob",
                email: "bob@gmail.com",
                password: "password",
            };
            const response = await request(app)
                .post("/api/users/register")
                .send(user);

            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty("accessToken");

            // Verify that the user was created in the database.
            const createdUser = await UsersModel.findOne({
                email: user.email,
            }).lean();
            expect(createdUser).toBeDefined();
            expect(createdUser.email).toEqual(user.email);
        });

        it("should not register a user with missing email", async () => {
            const user = {
                name: "Alice",
                password: "password",
            };
            const response = await request(app)
                .post("/api/users/register")
                .send(user);

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty("message");
        });

        it("should not register a user with missing password", async () => {
            const user = {
                name: "Charlie",
                email: "charlie@gmail.com",
            };
            const response = await request(app)
                .post("/api/users/register")
                .send(user);

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty("message");
        });

        it("should not register a user with an invalid email format", async () => {
            const user = {
                name: "David",
                email: "not-an-email",
                password: "password",
            };
            const response = await request(app)
                .post("/api/users/register")
                .send(user);

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty("message");
        });

        it("should not allow duplicate registration with the same email", async () => {
            const user = {
                name: "Eve",
                email: "eve@gmail.com",
                password: "password",
            };
            // First registration should succeed
            const firstResponse = await request(app)
                .post("/api/users/register")
                .send(user);
            expect(firstResponse.status).toEqual(200);
            expect(firstResponse.body).toHaveProperty("accessToken");

            // Second registration with the same email should fail
            const secondResponse = await request(app)
                .post("/api/users/register")
                .send(user);
            expect(secondResponse.status).toBeGreaterThanOrEqual(400);
            expect(secondResponse.body).toHaveProperty("message");
        });
    });

    describe("POST /api/users/login", () => {
        // Since your db-config seeds the user "Alice" only once (and no beforeEach/afterEach
        // clears the DB), we can rely on the seeded user "Alice" being present.
        // We assume her credentials are:
        //   email: "alice@example.com"
        //   password: "password"  <-- Ensure this is the known plain text for testing.
        it("should login the seeded user 'Alice' with valid credentials", async () => {
            const credentials = {
                email: "alice@example.com",
                password: "password",
            };
            const response = await request(app)
                .post("/api/users/login")
                .send(credentials);

            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty("accessToken");
        });

        it("should not login 'Alice' with an incorrect password", async () => {
            const credentials = {
                email: "alice@example.com",
                password: "wrongpassword",
            };
            const response = await request(app)
                .post("/api/users/login")
                .send(credentials);

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty("message");
        });

        it("should not login with a non-existent email", async () => {
            const credentials = {
                email: "nonexistent@example.com",
                password: "password",
            };
            const response = await request(app)
                .post("/api/users/login")
                .send(credentials);

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty("message");
        });

        it("should not login with missing email", async () => {
            const credentials = {
                password: "password",
            };
            const response = await request(app)
                .post("/api/users/login")
                .send(credentials);

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty("message");
        });

        it("should not login with missing password", async () => {
            const credentials = {
                email: "alice@example.com",
            };
            const response = await request(app)
                .post("/api/users/login")
                .send(credentials);

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body).toHaveProperty("message");
        });
    });
});
