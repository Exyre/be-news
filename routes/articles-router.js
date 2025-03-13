
const express = require("express");
const articlesRouter = express.Router();


const { getArticlesById, getAllArticles, patchArticleVotes } = require("../Controllers/articles.controller");
const { getCommentsByArticleId, postCommentByArticleId, removeCommentById } = require("../Controllers/comments.controller");

articlesRouter.get("/:article_id", getArticlesById);
articlesRouter.get("/", getAllArticles);
articlesRouter.patch("/:article_id", patchArticleVotes);

articlesRouter.get("/:article_id/comments", getCommentsByArticleId);
articlesRouter.post("/:article_id/comments", postCommentByArticleId);

articlesRouter.delete("/comments/:comment_id", removeCommentById);

module.exports = articlesRouter;
