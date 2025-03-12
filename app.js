const express = require("express");
const app = express();

const { getApiEndpoints } = require("./Controllers/apiController");
const { getAllTopics } = require("./Controllers/topics.controller");
const { getArticlesById } = require("./Controllers/articles.controller")
const { getAllArticles } = require("./Controllers/articles.controller");
const { getCommentsByArticleId } = require("./Controllers/comments.controller");

app.use(express.json());

app.get("/api", getApiEndpoints);

app.get("/api/topics", getAllTopics);

app.get("/api/articles/:article_id", getArticlesById)

app.get("/api/articles", getAllArticles)

app.get("/api/articles/:article_id/comments", getCommentsByArticleId)

app.use((err, req, res, next) => {
    if(err.status) {
        res.status(err.status).send({ msg: err.msg })
    } else if (err.code === "22P02") {
        res.status(400).send({ msg: "Invalid article_id" })
    } else {
        console.log(err);
        res.status(500).send({ msg: "Internal Server Error" })
    }
})

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

module.exports = app