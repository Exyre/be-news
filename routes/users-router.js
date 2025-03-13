const express = require("express");
const usersRouter = express.Router();

const { getAllUsers, getUserByUsername } = require("../Controllers/users.controller");

usersRouter.get("/:username", (req, res, next) => {
    if (!req.params.username.trim()) {  
        return res.status(400).send({ msg: "Username is required" });
    }
    next();
});

usersRouter.get("/", getAllUsers);
usersRouter.get("/:username", getUserByUsername);

module.exports = usersRouter;
