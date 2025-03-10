const endpointsJson = require("../endpoints.json");
const request = require("supertest")
const app = require("../app")
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data")
/* Set up your test imports here */
beforeEach(() => {
  seed(testData);
}) 

afterAll(() => db.end()) 
/* Set up your beforeEach & afterAll functions here */

describe("GET /api", () => {
  test.skip("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body; 

        expect(topics).toBeInstanceOf(Array);
        expect(topics.length).toBeGreaterThan(0);
        
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
          expect(topic).toHaveProperty("img_url");
        });
      });
  });

  test("404: Responds with error when path is invalid", () => {
    return request(app)
      .get("/api/not-a-route")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Route not found" });
      });
  });
});