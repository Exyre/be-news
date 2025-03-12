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

module.exports = { fetchCommentsByArticleId, insertCommentByArticleId, deleteCommentById }