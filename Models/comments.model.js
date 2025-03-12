const db = require("../db/connection")

function fetchCommentsByArticleId(article_id) {
    if (isNaN(article_id)) {
        return Promise.reject({ status: 400, msg: "Invalid article_id" });
    }

    return db.query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: "Article not found" });
            }

            return db.query(
                `SELECT comment_id, votes, created_at, author, body, article_id
                FROM comments
                WHERE article_id = $1
                ORDER BY created_at DESC;`,
                [article_id]
            );
        })
        .then(({ rows }) => {
            return rows;
        });
}

module.exports = { fetchCommentsByArticleId }