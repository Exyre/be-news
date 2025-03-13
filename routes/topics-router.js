const express = require("express");
const topicsRouter = express.Router();


const { getAllTopics } = require("../Controllers/topics.controller");

topicsRouter.get("/", getAllTopics);

module.exports = topicsRouter;
