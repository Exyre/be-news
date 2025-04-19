
const express = require("express");
const apiRouter = express.Router();


const { getApiEndpoints } = require("../Controllers/apiController");

apiRouter.get("/", getApiEndpoints);

module.exports = apiRouter;
