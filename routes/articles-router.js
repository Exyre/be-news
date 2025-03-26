const express = require("express");
const articlesRouter = express.Router();


const { getArticlesById, getAllArticles, patchArticleVotes, postArticle, removeArticleById } = require("../Controllers/articles.controller");
const { getCommentsByArticleId, postCommentByArticleId } = require("../Controllers/comments.controller");

articlesRouter.get("/:article_id", getArticlesById);
articlesRouter.get("/", getAllArticles);
articlesRouter.patch("/:article_id", patchArticleVotes);

articlesRouter.post("/", postArticle)

articlesRouter.get("/:article_id/comments", getCommentsByArticleId);
articlesRouter.post("/:article_id/comments", postCommentByArticleId);

articlesRouter.delete("/:article_id", removeArticleById);

module.exports = articlesRouter;
