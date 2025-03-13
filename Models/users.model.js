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

function fetchUserByUsername(username) {
    if (!username) {
        return Promise.reject({ status: 400, msg: "Username is required" });
    }

    if (username.trim() === "") {
        return Promise.reject({ status: 400, msg: "Username cannot be empty" });
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/; 
    if (!usernameRegex.test(username)) {
        return Promise.reject({ status: 400, msg: "Username contains invalid characters" });
    }

    
    return db
        .query("SELECT username, name, avatar_url FROM users WHERE username = $1", [username])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: "User not found" });
            }
            return rows[0]; 
        });
}


module.exports = { fetchAllUsers, fetchUserByUsername };