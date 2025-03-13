const { fetchAllUsers, fetchUserByUsername } = require("../Models/users.model");

function getAllUsers(req, res, next) {
    console.log(req)
    fetchAllUsers()
        .then((users) => {
            res.status(200).send({ users });
        })
        .catch(next);
}

function getUserByUsername(req, res, next) {
    const  username  = req.params.username;
    console.log(username)
    if (!username) {
        res.status(400).send({ status: 400, msg: "Username is required" });
    }
    fetchUserByUsername(username)
        .then((user) => {
            res.status(200).send({ user });
        })
        .catch(next);
} 

module.exports = { getAllUsers, getUserByUsername };