const db = require("../db/connection");

function fetchAllUsers() {
    return db.query(`SELECT username, name, avatar_url FROM users`)
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: "No users found" });
            }
            return rows;
        });
}

module.exports = { fetchAllUsers };