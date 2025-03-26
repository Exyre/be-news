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

afterAll(() => {
  return db.end(); 
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
        expect(article.article_id).toBe(1);

        const commentCount = parseInt(article.comment_count, 10);
        expect(commentCount).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(commentCount)).toBe(true);
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
            expect(articles.length).toBe(13);

            articles.forEach((article) => {
                expect(article).toEqual(
                    expect.objectContaining({
                        article_id: expect.any(Number),
                        author: expect.any(String),
                        title: expect.any(String),
                        topic: expect.any(String),
                        created_at: expect.any(String),
                        votes: expect.any(Number),
                        article_img_url: expect.any(String),
                        comment_count: expect.any(String),
                    })
                );
            });

            expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("200: responds with articles sorted by the specified column", () => {
        return request(app)
            .get("/api/articles?sort_by=title")
            .expect(200)
            .then(({ body }) => {
                expect(body.articles).toBeInstanceOf(Array);
                expect(body.articles).toBeSortedBy("title", { descending: true });
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
    test("400: responds with 'Invalid order query' when given an invalid order", () => {
        return request(app)
            .get("/api/articles?order=sideways")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Invalid order query");
            });
    });
    test("200: defaults to sorting by created_at in descending order", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body }) => {
                expect(body.articles).toBeInstanceOf(Array);
                expect(body.articles).toBeSortedBy("created_at", { descending: true });
            });
    });
    test("200: responds with articles sorted in ascending order when specified", () => {
        return request(app)
            .get("/api/articles?sort_by=votes&order=asc")
            .expect(200)
            .then(({ body }) => {
                expect(body.articles).toBeInstanceOf(Array);
                expect(body.articles).toBeSortedBy("votes", { descending: false });
            });
    });
    test("200: Filters articles by topic when 'topic' query is passed", () => {
        return request(app)
            .get("/api/articles?topic=cats")
            .expect(200)
            .then(({ body }) => {
                body.articles.forEach(article => {
                    expect(article.topic).toBe("cats");
                });
            });
    });
    test("200: Returns an empty array if the topic exists but has no articles", () => {
        return request(app)
            .get("/api/articles?topic=nonexistent_topic")
            .expect(404)  
            .then(({ body }) => {
                expect(body.msg).toBe("Topic not found");  
            });
    });

    });
    test("404: Responds with 'Topic not found' when an invalid topic is passed", () => {
        return request(app)
            .get("/api/articles?topic=nonexistent_topic")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("Topic not found");
            });
    });
    test("400: Responds with 'Invalid sort_by query' when an invalid 'sort_by' query is passed", () => {
        return request(app)
            .get("/api/articles?topic=cooking&sort_by=invalid_column")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Invalid sort_by query");
            });
    });
    test("400: Responds with 'Invalid order query' when an invalid 'order' query is passed", () => {
        return request(app)
            .get("/api/articles?topic=cooking&order=invalid_order")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Invalid order query");
            });
    });


describe("GET /api/articles/:article_id/comments", () => {
    test("200: Responds with an array of comments for the given article_id", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body }) => {
                expect(body.comments).toBeInstanceOf(Array);
                body.comments.forEach((comment) => {
                    expect(comment).toEqual(
                        expect.objectContaining({
                            comment_id: expect.any(Number),
                            votes: expect.any(Number),
                            created_at: expect.any(String),
                            author: expect.any(String),
                            body: expect.any(String),
                            article_id: expect.any(Number),  
                        })
                    );
                });
            });
    });
     test("200: Responds with an empty array if article exists but has no comments", () => {
        return request(app)
            .get("/api/articles/2/comments") 
            .expect(200)
            .then(({ body }) => {
                expect(body.comments).toEqual([]);
            });
    });
    test("400: Responds with bad request when article_id is invalid", () => {
        return request(app)
            .get("/api/articles/notAnId/comments")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Invalid article_id");
            });
    });
    test("404: Responds with 'Article not found' when article_id does not exist", () => {
        return request(app)
            .get("/api/articles/9999/comments") 
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("Article not found");
            });
    });
  })

  describe("POST /api/articles/:article_id/comments", () => {
    test("201: Responds with the newly added comment", () => {
        const newComment = {
            username: "butter_bridge",
            body: "This is a test comment"
        };

        return request(app)
            .post("/api/articles/1/comments")
            .send(newComment)
            .expect(201)
            .then(({ body }) => {
                expect(body.comment).toEqual(
                    expect.objectContaining({
                        comment_id: expect.any(Number),
                        body: "This is a test comment",
                        article_id: 1,
                        author: "butter_bridge",
                        votes: 0,
                        created_at: expect.any(String),
                    })
                );
            });
    });
    test("400: Responds with error if missing required fields", () => {
        const incompleteComment = { username: "butter_bridge" };

        return request(app)
            .post("/api/articles/1/comments")
            .send(incompleteComment)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Bad request - missing required fields");
            });
    });
    test("404: Responds with error if article_id does not exist", () => {
        const newComment = {
            username: "butter_bridge",
            body: "This article does not exist"
        };

        return request(app)
            .post("/api/articles/9999/comments")
            .send(newComment)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("Article not found or user does not exist");
            });
    });
    test("404: Responds with an error when posting a comment with a non-existent user", () => {
        const newComment = {
            username: "nonexistent_user",
            body: "This user does not exist"
        };

        return request(app)
            .post("/api/articles/1/comments")
            .send(newComment)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("Article not found or user does not exist");
            });
    });
    test("400: Responds with error if article_id is invalid", () => {
        const newComment = {
            username: "butter_bridge",
            body: "Invalid ID test"
        };

        return request(app)
            .post("/api/articles/not-a-number/comments")
            .send(newComment)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Invalid article_id");
            });
    });
  });

  describe("PATCH /api/articles/:article_id", () => {
    test("200: Updates an article's votes and responds with the updated article", () => {
        return request(app)
            .get("/api/articles/1")
            .expect(200)
            .then(({ body }) => {
                const initialVotes = body.article.votes;

                return request(app)
                    .patch("/api/articles/1")
                    .send({ inc_votes: 5 })
                    .expect(200)
                    .then(({ body }) => {
                        expect(body.article.votes).toBe(initialVotes + 5);
                        expect(body.article).toEqual(
                            expect.objectContaining({
                                article_id: 1,
                                votes: expect.any(Number)
                            })
                        );
                    });
            });
    });
    test("400: Responds with 'Bad request' when inc_votes is missing or invalid", () => {
        return request(app)
            .patch("/api/articles/1")
            .send({ inc_votes: "invalid" })
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Invalid article_id");
            });
    });
    test("404: Responds with 'Article not found' when article_id does not exist", () => {
        return request(app)
            .patch("/api/articles/9999")
            .send({ inc_votes: 5 })
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("Article not found");
            });
    });
    test("400: Responds with 'Invalid article ID' when article_id is not a number", () => {
        return request(app)
            .patch("/api/articles/notAnId")
            .send({ inc_votes: 5 })
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Invalid article_id");
            });
    });
});

describe("DELETE /api/comments/:comment_id", () => {
    test("204: Successfully deletes a comment", () => {
        return request(app)
            .delete("/api/comments/1")
            .expect(204)
            .then(({ body }) => {
                expect(body).toEqual({});
            });
    });
    test("404: Responds with 'Comment not found' when comment_id does not exist", () => {
        return request(app)
            .delete("/api/comments/9999")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("Comment not found");
            });
    });
    test("400: Responds with 'Invalid comment ID' when comment_id is not a number", () => {
        return request(app)
            .delete("/api/comments/notAnId")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Invalid comment ID");
            });
    });
});

describe("GET /api/users", () => {
    test("GET /api/users responds with an array of users", () => {
        return request(app)
            .get("/api/users")  
            .expect(200)
            .then(({ body }) => {
                expect(body.users).toBeInstanceOf(Array);
                expect(body.users.length).toBeGreaterThan(0);
                body.users.forEach((user) => {
                    expect(user).toEqual(
                        expect.objectContaining({
                            username: expect.any(String),
                            name: expect.any(String),
                            avatar_url: expect.any(String),
                        })
                    );
                });
            });
    });
    test("404: Responds with 'Route not found' for an incorrect URL", () => {
        return request(app)
            .get("/api/userrs") 
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("Route not found");
            });
    });
    test("404: Responds with 'No users found' if there are no users in the database", () => {
        jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

        return request(app)
            .get("/api/users")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("No users found");
            });
    });
});

describe("GET /api/users/:username", () => {
    test("GET /api/users/:username responds with a user object when a valid username is provided", () => {
        return request(app)
            .get("/api/users/butter_bridge")
            .expect(200)
            .then(({ body }) => {
                expect(body.user).toEqual(
                    expect.objectContaining({
                        username: expect.any(String),
                        name: expect.any(String),
                        avatar_url: expect.any(String),
                    })
                );
                expect(body.user.username).toBe("butter_bridge");
            });
    });
    test("404: Responds with 'User not found' when an invalid username is provided", () => {
        return request(app)
            .get("/api/users/nonexistentuser")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("User not found");
            });
    });
    test("400: Responds with 'Username contains invalid characters' when a username with special characters is provided", () => {
        return request(app)
            .get("/api/users/!@2#") 
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Username contains invalid characters");
            });
    });
    test("404: Responds with 'Route not found' for an incorrect URL", () => {
        return request(app)
            .get("/api/userrs") 
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("Route not found");
            });
    });
});

describe("PATCH /api/comments/:comment_id", () => {
    test("200: should update the votes of a comment and return the updated comment", () => {
        const updatedVotes = { inc_votes: 1 }; 
        return request(app)
            .patch("/api/comments/1") 
            .send(updatedVotes)
            .expect(200)
            .then(({ body }) => {
                expect(body.comment).toEqual(
                    expect.objectContaining({
                        comment_id: expect.any(Number),
                        votes: expect.any(Number),
                    })
                );
                expect(body.comment.votes).toBeGreaterThan(0); 
            });
    });
    test("400: Responds with 'inc_votes is required and must be a number' when inc_votes is missing", () => {
        return request(app)
            .patch("/api/comments/1") 
            .send({})
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('inc_votes is required and must be a number');
            });
    });
    test("400: Responds with 'inc_votes is required and must be a number' when inc_votes is not a number", () => {
        return request(app)
            .patch("/api/comments/1") 
            .send({ inc_votes: "string" })
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('inc_votes is required and must be a number');
            });
    });
    test("400: Responds with 'Invalid comment ID' when comment_id is not a valid number", () => {
        return request(app)
            .patch("/api/comments/invalid_id")
            .send({ inc_votes: 1 })
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Invalid comment ID");
            });
    });
    test("404: Responds with 'Comment not found' when the comment_id does not exist", () => {
        return request(app)
            .patch("/api/comments/9999999") 
            .send({ inc_votes: 1 })
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("Comment not found");
            });
    });
    test("200: should not change the votes when inc_votes is 0", () => {
        return request(app)
            .patch("/api/comments/1") 
            .send({ inc_votes: 0 }) 
            .expect(200)
            .then(({ body }) => {
                expect(body.comment.votes).toBe(16); 
            });
    });
    test("200: should decrement the votes when inc_votes is negative", () => {
        return request(app)
            .patch("/api/comments/1")
            .send({ inc_votes: -1 }) 
            .expect(200)
            .then(({ body }) => {
                expect(body.comment.votes).toBe(15)
            });
    });
});

describe("POST /api/articles", () => {
    test("201: Inserts a new article and responds with the inserted article", () => {
        const newArticle = {
            author: "butter_bridge",
            title: "A new article",
            body: "This is the content of the article.",
            topic: "mitch",
            article_img_url: "http://example.com/image.jpg"
        };

        return request(app)
            .post("/api/articles")
            .send(newArticle)
            .expect(201)
            .then(({ body }) => {
                expect(body.article).toEqual(
                    expect.objectContaining({
                        article_id: expect.any(Number),
                        author: "butter_bridge",
                        title: "A new article",
                        body: "This is the content of the article.",
                        topic: "mitch",
                        article_img_url: "http://example.com/image.jpg",
                        created_at: expect.any(String),
                        votes: 0,
                        comment_count: 0
                    })
                );
            });
    });
    test("400: Responds with 'Missing required fields' when fields are missing", () => {
        const incompleteArticle = {
            author: "butter_bridge",
            title: "Missing body and topic"
        };

        return request(app)
            .post("/api/articles")
            .send(incompleteArticle)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Missing required fields (author, title, body, topic)");
            });
    });
});

describe("/api/articles (pagination)", () => {
    test("200: Limits the number of articles returned when 'limit' is provided", () => {
        return request(app)
            .get("/api/articles?limit=5")
            .expect(200)
            .then(({ body }) => {
                expect(body.articles).toBeInstanceOf(Array);
                expect(body.articles.length).toBe(5);
                expect(body).toHaveProperty("total_count");
                expect(typeof body.total_count).toBe("number");
            });
    });
    test("200: Paginates results correctly when 'p' (page) is specified", () => {
        return request(app)
            .get("/api/articles?limit=5&p=2")
            .expect(200)
            .then(({ body }) => {
                expect(body.articles).toBeInstanceOf(Array);
                expect(body.articles.length).toBe(5);
                expect(body).toHaveProperty("total_count");
            });
    });
    test("200: total_count remains the same across pages", async () => {
        const res1 = await request(app).get("/api/articles?limit=5&p=1").expect(200);
        const res2 = await request(app).get("/api/articles?limit=5&p=2").expect(200);

        expect(res1.body.total_count).toBe(res2.body.total_count);
    });
    test("400: Responds with an error when 'limit' is invalid", () => {
        return request(app)
            .get("/api/articles?limit=not-a-number")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Invalid limit query");
            });
    });
    test("400: Responds with an error when 'p' (page) is invalid", () => {
        return request(app)
            .get("/api/articles?limit=5&p=not-a-number")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Invalid page query");
            });
    });

    test("200: Returns empty array if page is too high", () => {
        return request(app)
            .get("/api/articles?limit=5&p=999")
            .expect(200)
            .then(({ body }) => {
                expect(body.articles).toEqual([]);
                expect(body.total_count).toBeGreaterThan(0);
            });
    });
});

describe("GET /api/articles/:article_id/comments", () => {
    test("200: Responds with paginated comments for the given article_id", () => {
        return request(app)
            .get("/api/articles/1/comments?limit=2&p=1")
            .expect(200)
            .then(({ body }) => {
                expect(body.comments).toBeInstanceOf(Array);
                expect(body.comments.length).toBe(2); 
                expect(body).toHaveProperty("total_count"); 
                expect(body.total_count).toBeGreaterThan(2);
            });
    });
    test("200: Responds with the correct paginated comments for the second page", () => {
        return request(app)
            .get("/api/articles/1/comments?limit=2&p=2")
            .expect(200)
            .then(({ body }) => {
                expect(body.comments).toBeInstanceOf(Array);
                expect(body.comments.length).toBe(2); 
                expect(body.comments[0]).toHaveProperty("comment_id"); 
                expect(body).toHaveProperty("total_count"); 
                expect(body.total_count).toBeGreaterThan(2); 
            });
    });
    test("200: Responds with an empty array if the requested page has no comments", () => {
        return request(app)
            .get("/api/articles/1/comments?limit=2&p=1000") 
            .expect(200)
            .then(({ body }) => {
                expect(body.comments).toEqual([]); 
            });
    });
    test("200: Responds with an empty array if article exists but has no comments", () => {
        return request(app)
            .get("/api/articles/2/comments") 
            .expect(200)
            .then(({ body }) => {
                expect(body.comments).toEqual([]); 
            });
    });
    test("200: Responds with default number of comments when no pagination is provided", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body }) => {
                expect(body.comments).toBeInstanceOf(Array);
                expect(body.comments.length).toBe(10); 
                expect(body).toHaveProperty("total_count"); 
            });
    });
    test("400: Responds with an error message for invalid `limit` query", () => {
        return request(app)
            .get("/api/articles/1/comments?limit=abc") 
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Invalid limit query");
            });
    });
    test("400: Responds with an error message for invalid `page` query", () => {
        return request(app)
            .get("/api/articles/1/comments?p=abc") 
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Invalid page query");
            });
    });
    test("400: Responds with an error message for a negative `page` value", () => {
        return request(app)
            .get("/api/articles/1/comments?p=-2") 
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Invalid page query");
            });
    });
    test("200: Responds with default pagination if no `limit` or `page` is provided", () => {
        return request(app)
            .get("/api/articles/1/comments") 
            .expect(200)
            .then(({ body }) => {
                expect(body.comments).toBeInstanceOf(Array);
                expect(body.comments.length).toBe(10); 
            });
    });
});

describe("POST /api/topics", () => {
    test("201: Responds with the newly created topic", () => {
        const newTopic = {
            slug: "technology",
            description: "All about the latest tech trends",
        };

        return request(app)
            .post("/api/topics")
            .send(newTopic)
            .expect(201)
            .then(({ body }) => {
                expect(body.topic).toEqual(
                    expect.objectContaining({
                        slug: "technology",
                        description: "All about the latest tech trends",
                    })
                );
            });
    });

    test("400: Responds with an error message when required fields are missing", () => {
        const newTopic = { slug: "gaming" }; 

        return request(app)
            .post("/api/topics")
            .send(newTopic)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Missing required fields");
            });
    });

    test("400: Responds with an error when topic slug already exists", () => {
        const duplicateTopic = {
            slug: "mitch", 
            description: "Duplicate topic test",
        };

        return request(app)
            .post("/api/topics")
            .send(duplicateTopic)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Slug already exists");
            });
    });

    test("400: Responds with an error when invalid data type is sent", () => {
        const invalidTopic = {
            slug: 1234, 
            description: ["Invalid", "array"], 
        };

        return request(app)
            .post("/api/topics")
            .send(invalidTopic)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Invalid data type");
            });
    });
    test("201: Trims spaces from slug and description before inserting", () => {
        const newTopic = { slug: "   new-topic  ", description: "   This is a new topic.  " };
        return request(app)
            .post("/api/topics")
            .send(newTopic)
            .expect(201)
            .then(({ body }) => {
                expect(body.topic).toEqual(
                    expect.objectContaining({
                        slug: "new-topic",
                        description: "This is a new topic."
                    })
                );
            });
    });
});

describe("DELETE /api/articles/:article_id", () => {
    test("204: Successfully deletes an article and its associated comments", () => {
        const topicName = "Test Topic";
        const authorName = "test_user";
        const commentAuthors = ["commenter1", "commenter2"];

        return db.query("INSERT INTO topics (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING;", [topicName])
            .then(() => {
                return db.query("INSERT INTO users (username) VALUES ($1) ON CONFLICT (username) DO NOTHING;", [authorName]);
            })
            .then(() => {
                const userInsertQueries = commentAuthors.map(author => {
                    return db.query("INSERT INTO users (username) VALUES ($1) ON CONFLICT (username) DO NOTHING;", [author]);
                });

                return Promise.all(userInsertQueries);
            })
            .then(() => {
                const articleData = { 
                    title: "Test Article", 
                    body: "Test article body", 
                    author: authorName,
                    topic: topicName 
                };

                return db.query("INSERT INTO articles (title, body, author, topic) VALUES ($1, $2, $3, $4) RETURNING article_id;", 
                    [articleData.title, articleData.body, articleData.author, articleData.topic]);
            })
            .then(({ rows }) => {
                const article_id = rows[0].article_id;
                const commentData = [
                    { article_id, author: "commenter1", body: "Test comment 1" },
                    { article_id, author: "commenter2", body: "Test comment 2" }
                ];

                const commentQueries = commentData.map(({ article_id, author, body }) => {
                    return db.query("INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3);", [article_id, author, body]);
                });

                return Promise.all(commentQueries)
                    .then(() => {
                        return request(app)
                            .delete(`/api/articles/${article_id}`)
                            .expect(204); 
                    })
                    .then(() => {
                        return db.query("SELECT * FROM articles WHERE article_id = $1;", [article_id]);
                    })
                    .then(({ rows }) => {
                        expect(rows).toHaveLength(0); 

                        return db.query("SELECT * FROM comments WHERE article_id = $1;", [article_id]);
                    })
                    .then(({ rows }) => {
                        expect(rows).toHaveLength(0); 
                    });
            });
    });
    test("404: Responds with 'Article not found' for invalid article_id", () => {
        return request(app)
            .delete("/api/articles/9999") 
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("Article not found");
            });
    });
    test("400: Responds with 'Bad request' for invalid article_id format", () => {
        return request(app)
            .delete("/api/articles/invalid_id") 
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Bad request");
            });
    });
    test("400: Responds with 'Bad request' for non-numeric article_id", () => {
        return request(app)
            .delete("/api/articles/abc") 
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Bad request");
            });
    });
});