const db = require("../db/connection")

function fetchCommentsByArticleId(article_id) {
    return db.query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: "Article not found" });
            }
        })
        .then(() => {
            return db.query(`SELECT * FROM comments WHERE article_id = $1;`, [article_id])
                .then(({ rows }) => rows);
        });
}

function insertCommentByArticleId(article_id, username, body) {
    return db.query(
        `INSERT INTO comments (article_id, author, body, votes, created_at) 
         VALUES ($1, $2, $3, 0, NOW()) 
         RETURNING *;`,
        [article_id, username, body]
    )
    .then(({ rows }) => {
        return rows[0];
    });
};

function deleteCommentById(comment_id) {
    return db.query(
        `DELETE FROM comments WHERE comment_id = $1 RETURNING *`, [comment_id]
    )
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: "Comment not found" })
        }
    }) 
}

function updateVotesOnComment(comment_id, inc_votes) {
    if (!comment_id || isNaN(comment_id)) {
        return Promise.reject({ status: 400, msg: "Invalid comment ID" })
    } 

    if (inc_votes === undefined || isNaN(inc_votes)) {
        return Promise.reject({ status: 400, msg: "inc_votes is required and must be a number" });
    }

    return db.query(
       `UPDATE comments
        SET votes = votes + $1
        WHERE comment_id = $2
        RETURNING comment_id, votes`,
        [inc_votes, comment_id]
    )
    .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: "Comment not found" });
            }
            return rows[0]; 
        });
}

module.exports = { fetchCommentsByArticleId, insertCommentByArticleId, deleteCommentById, updateVotesOnComment }