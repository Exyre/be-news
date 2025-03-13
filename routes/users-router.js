const express = require("express");
const usersRouter = express.Router();

const { getAllUsers } = require("../Controllers/users.controller");

usersRouter.get("/", getAllUsers);

module.exports = usersRouter;
