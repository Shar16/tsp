const request = require("supertest");
const app = require("../../src/index");

describe("[E2E] / (General)", () => {
    describe("GET /", () => {
        it("should check the root route of the server", async () => {
            const response = await request(app).get("/").expect(200);

            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty("message");
        });
    });
});
