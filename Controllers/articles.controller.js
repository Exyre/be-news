const db = require("../db/connection")
const { fetchArticleById, fetchAllArticles, updateArticleVotes, insertArticle, deleteArticleById } = require("../Models/articles.model");

function getArticlesById(req, res, next) {
    const { article_id } = req.params;

    fetchArticleById(article_id)
        .then((article) => {
            res.status(200).send({ article })
        })
        .catch(next);
} 

function getAllArticles(req, res, next) {
    const { sort_by, order, topic, limit, p } = req.query;

    fetchAllArticles(sort_by, order, topic, limit, p)
        .then(({ articles, total_count }) => {
            res.status(200).send({ articles, total_count: Number(total_count) });
        })
        .catch(next);
}


function patchArticleVotes(req, res, next) {
    const { article_id } = req.params;
    const { inc_votes } = req.body;

    updateArticleVotes(article_id, inc_votes)
        .then((updatedArticle) => {
            res.status(200).send({ article: updatedArticle });
        })
        .catch(next);
}

function postArticle(req, res, next) {
    const { author, title, body, topic, article_img_url } = req.body;

    insertArticle(author, title, body, topic, article_img_url)
        .then((article) => {
            res.status(201).send({ article });
        })
        .catch(next);
}

function removeArticleById(req, res, next) {
    const { article_id } = req.params;

    deleteArticleById(article_id)
        .then(() => {
            res.status(204).send();
        })
        .catch(next);
}

module.exports = { getArticlesById, getAllArticles, patchArticleVotes, postArticle, removeArticleById }
