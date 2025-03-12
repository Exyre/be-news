const { fetchCommentsByArticleId, insertCommentByArticleId, deleteCommentById} = require("../Models/comments.model")

function getCommentsByArticleId(req, res, next) {
    const { article_id } = req.params;

    fetchCommentsByArticleId(article_id)
        .then((comments) => {
            res.status(200).send({ comments });
        })
        .catch(next);
}

function postCommentByArticleId(req, res, next) {
    const { article_id } = req.params
    const { username, body } = req.body

    if (!username || !body) {
        return res.status(400).send({ msg: "Bad request - missing required fields" });
    }

    insertCommentByArticleId(article_id, username, body)
        .then((comment) => {
            res.status(201).send({ comment });
        })
        .catch((err) => {
            if (err.code === "23503") {
                res.status(404).send({ msg: "Article not found or user does not exist" });
            } else if (err.code === "22P02") {
                res.status(400).send({ msg: "Invalid article ID" })
            } else {
                next(err)
            }
        })
}

function removeCommentById(req, res, next) {
    const { comment_id } = req.params

    deleteCommentById(comment_id)
        .then(() => {
            res.status(204).send();
        })
        .catch(next)
}

module.exports = { getCommentsByArticleId, postCommentByArticleId, removeCommentById };