const db = require("../db/connection")
const { fetchArticleById, fetchAllArticles } = require("../Models/articles.model");

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

module.exports = { getArticlesById, getAllArticles }
