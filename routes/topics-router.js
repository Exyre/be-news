const express = require("express");
const topicsRouter = express.Router();


const { getAllTopics, postTopic } = require("../Controllers/topics.controller");

topicsRouter.get("/", getAllTopics);

topicsRouter.post("/", postTopic);

module.exports = topicsRouter;
