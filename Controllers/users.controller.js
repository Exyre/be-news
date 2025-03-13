const { fetchAllUsers } = require("../Models/users.model");

function getAllUsers(req, res, next) {
    fetchAllUsers()
        .then((users) => {
            res.status(200).send({ users });
        })
        .catch(next);
}

module.exports = { getAllUsers };