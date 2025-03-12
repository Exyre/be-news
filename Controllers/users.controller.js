const { fetchAllUsers } = require("../Models/users.model");

function getAllUsers(req, res, next) {
    fetchAllUsers()
        .then((users) => {
            if (users.length === 0) {
                return res.status(404).send({ msg: "No users found" });
            }
            res.status(200).send({ users });
        })
        .catch(next);
}

module.exports = { getAllUsers };