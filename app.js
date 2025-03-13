const express = require("express");
const app = express();

const { getApiEndpoints } = require("./Controllers/apiController");
const { getAllTopics } = require("./Controllers/topics.controller");
const { getArticlesById } = require("./Controllers/articles.controller");
const { getAllArticles } = require("./Controllers/articles.controller");
const { getCommentsByArticleId, postCommentByArticleId, removeCommentById } = require("./Controllers/comments.controller");
const { patchArticleVotes } = require("./Controllers/articles.controller");
const { getAllUsers } = require("./Controllers/users.controller");
const { handleCustomErrors, handleServerErrors } = require("./errors/index")

app.use(express.json());

app.get("/api", getApiEndpoints);

app.get("/api/topics", getAllTopics);

app.get("/api/articles/:article_id", getArticlesById);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.patch("/api/articles/:article_id", patchArticleVotes);

app.delete("/api/comments/:comment_id", removeCommentById);

app.get("/api/users", getAllUsers);

app.use(handleCustomErrors);

app.use(handleServerErrors);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

module.exports = app