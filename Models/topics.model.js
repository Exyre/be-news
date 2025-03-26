const db = require("../db/connection")

function fetchAllTopics() {
    return db.query("SELECT * FROM topics")
        .then(({ rows }) => {
            return rows;
    })
};

function insertTopic(slug, description) {
    if (!slug || !description) {
        return Promise.reject({ status: 400, msg: "Missing required fields" });
    }

    if (typeof slug !== "string" || typeof description !== "string") {
        return Promise.reject({ status: 400, msg: "Invalid data type" });
    }

    slug = slug.trim();
    description = description.trim();

    return db
        .query(`SELECT * FROM topics WHERE slug = $1;`, [slug])
        .then(({ rows }) => {
            if (rows.length > 0) {
                return Promise.reject({ status: 400, msg: "Slug already exists" });
            }

            return db.query(
                `INSERT INTO topics (slug, description) VALUES ($1, $2) RETURNING *;`,
                [slug, description]
            );
        })
        .then(({ rows }) => rows[0]);
}



module.exports = { fetchAllTopics, insertTopic }