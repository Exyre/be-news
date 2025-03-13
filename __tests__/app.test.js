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
                            article_id: 1, 
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
