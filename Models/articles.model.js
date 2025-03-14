const db = require("../db/connection")

function fetchArticleById(article_id) {
    return db.query(`
        SELECT articles.*, COUNT(comments.article_id) AS comment_count
        FROM articles
        LEFT JOIN comments ON comments.article_id = articles.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id
    `, [article_id])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: "Article not found" });
            }
            return rows[0];
        });
};

function fetchAllArticles(sort_by = "created_at", order = "desc", topic) {
    const validSortBy = ["article_id", "title", "author", "created_at", "votes", "comment_count"];
    const validOrder = ["asc", "desc"];

    if (!validSortBy.includes(sort_by)) {
        return Promise.reject({ status: 400, msg: "Invalid sort_by query" });
    }
    if (!validOrder.includes(order)) {
        return Promise.reject({ status: 400, msg: "Invalid order query" });
    }

    let queryStr = `
        SELECT articles.*, COUNT(comments.article_id) AS comment_count
        FROM articles
        LEFT JOIN comments ON comments.article_id = articles.article_id
    `;
    let queryParams = [];

    if (topic) {
        return db.query(`SELECT * FROM topics WHERE slug = $1`, [topic])
            .then(({ rows }) => {
                if (rows.length === 0) {
                    return Promise.reject({ status: 404, msg: "Topic not found" });
                }

                queryStr += ` WHERE topic = $1`;
                queryParams.push(topic);

                queryStr += ` 
                    GROUP BY articles.article_id
                    ORDER BY ${sort_by} ${order};
                `;

                return db.query(queryStr, queryParams);
            })
            .then(({ rows }) => {
                return rows.length === 0 ? [] : rows; 
            });
    }

    queryStr += ` 
        GROUP BY articles.article_id
        ORDER BY ${sort_by} ${order};
    `;

    return db.query(queryStr, queryParams).then(({ rows }) => rows);
}



function updateArticleVotes(article_id, inc_votes) {
    return db.query(
        `UPDATE articles
         SET votes = votes + $1
         WHERE article_id = $2
         RETURNING *`, [inc_votes, article_id]
    )
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: "Article not found" })
        }
        return rows[0];
    });
}

function insertArticle(author, title, body, topic, article_img_url = null) {
    if (!author || !title || !body || !topic) {
        return Promise.reject({
            status: 400,
            msg: "Missing required fields (author, title, body, topic)",
        });
    }

    const default_img_url = "http://defaultimage.com/default.jpg";
    const imageUrl = article_img_url || default_img_url;

    return db
        .query(
            `INSERT INTO articles (author, title, body, topic, article_img_url)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING article_id, author, title, body, topic, article_img_url, created_at, votes`,
            [author, title, body, topic, imageUrl]
        )
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({
                    status: 400,
                    msg: "Error adding article",
                });
            }

            const article = rows[0];

            
            return db
                .query(
                    `SELECT COUNT(*) AS comment_count FROM comments WHERE article_id = $1`,
                    [article.article_id]
                )
                .then(({ rows }) => {
                    article.comment_count = Number(rows[0].comment_count);
                    return article;
                });
        });
}

module.exports = { fetchArticleById, fetchAllArticles, updateArticleVotes, insertArticle };