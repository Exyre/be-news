const db = require("../db/connection")
const { fetchArticleById, fetchAllArticles, updateArticleVotes } = require("../Models/articles.model");

function getArticlesById(req, res, next) {
    const { article_id } = req.params;

    fetchArticleById(article_id)
        .then((article) => {
            res.status(200).send({ article })
        })
        .catch(next);
} 

function getAllArticles(req, res, next) {
    const { sort_by, order } = req.query

    fetchAllArticles(sort_by, order)
        .then((articles) => {
            res.status(200).send({ articles });
        })
        .catch(next);
}

function patchArticleVotes(req, res, next) {
    const { article_id } = req.params;
    const { inc_votes } = req.body;

     if (typeof inc_votes !== "number") {
        return res.status(400).send({ msg: "Bad request - inc_votes must be a number" });
    }

    updateArticleVotes(article_id, inc_votes)
        .then((updatedArticle) => {
            res.status(200).send({ article: updatedArticle });
        })
        .catch(next);
}

module.exports = { getArticlesById, getAllArticles, patchArticleVotes }
