const { fetchCommentsByArticleId, insertCommentByArticleId, deleteCommentById, updateVotesOnComment} = require("../Models/comments.model")

function getCommentsByArticleId(req, res, next) {
    const { article_id } = req.params;
    const { p = 1, limit = 10 } = req.query;

    fetchCommentsByArticleId(article_id, limit, p)
        .then(({ comments, total_count }) => {
            res.status(200).send({
                comments,        
                total_count       
            });
        })
        .catch(next);  
    }


function postCommentByArticleId(req, res, next) {
    const { article_id } = req.params;
    const { username, body } = req.body;

    insertCommentByArticleId(article_id, username, body)
        .then((comment) => {
            res.status(201).send({ comment });
        })
        .catch(next);
}

function removeCommentById(req, res, next) {
    const { comment_id } = req.params

    deleteCommentById(comment_id)
        .then(() => {
            res.status(204).send();
        })
        .catch(next)
}

function updateCommentVotes(req, res, next) {
    const { comment_id } = req.params
    const { inc_votes } = req.body

    updateVotesOnComment(comment_id, inc_votes)
        .then((updatedComment) => {
            res.status(200).send({ comment: updatedComment });
        })
        .catch(next);
}

module.exports = { getCommentsByArticleId, postCommentByArticleId, removeCommentById, updateCommentVotes };