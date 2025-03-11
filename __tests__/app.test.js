const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
require('jest-sorted');

beforeEach(() =>{ 
  return seed(testData)
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(endpointsJson);
      });
  });
});

describe("/api/topics", () => {
  test("200: Responds with an array of all topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;

        expect(topics).toBeInstanceOf(Array);
        expect(topics.length).toBeGreaterThan(0);

        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug", expect.any(String));
          expect(topic).toHaveProperty("description", expect.any(String));
          expect(topic).toHaveProperty("img_url", expect.any(String));
        });
      });
  });

  test("404: Responds with an error message when given an invalid path", () => {
    return request(app)
      .get("/api/not-a-route")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Route not found" });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with the correct article object", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body

        expect(article).toBeInstanceOf(Object)
        expect(article).toHaveProperty("author");
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("article_id");
        expect(article).toHaveProperty("body");
        expect(article).toHaveProperty("topic");
        expect(article).toHaveProperty("created_at");
        expect(article).toHaveProperty("votes");
        expect(article).toHaveProperty("article_img_url");
      })
  })
  test("404: Responds with an error message when article_id does not exist", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Article not found" });
      });
  });
  test("400: Responds with an error message for invalid article_id", () => {
    return request(app)
      .get("/api/articles/not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Invalid article_id" });
      });
  });
})

describe("/api/articles", () => {
    test("200: Responds with an array of all articles with comment counts, sorted by date descending", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles).toBeInstanceOf(Array);
                expect(articles.length).toBeGreaterThan(0);

                articles.forEach((article) => {
                    expect(article).toHaveProperty("article_id");
                    expect(article).toHaveProperty("author");
                    expect(article).toHaveProperty("title");
                    expect(article).toHaveProperty("topic");
                    expect(article).toHaveProperty("created_at");
                    expect(article).toHaveProperty("votes");
                    expect(article).toHaveProperty("article_img_url");
                    expect(article).toHaveProperty("comment_count");
                });

                expect(articles).toBeSortedBy("created_at", { descending: true });
            });
    });
    test("400: Responds with an error message when sort_by query is invalid", () => {
      return request(app)
        .get("/api/articles?sort_by=invalid_column") 
        .expect(400)
        .then(({ body }) => {
          expect(body).toEqual({ msg: "Invalid sort_by query" });
        });
    });
});

afterAll(() => {
  return db.end(); 
});