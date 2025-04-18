const express = require("express");
const apiRouter = express.Router();
const { getApiEndpoints } = require("../Controllers/apiController");
const { seedDatabase } = require('../Controllers/db.controller');

// Only add the seed route if we're not in test environment
if (process.env.NODE_ENV !== 'test') {
  apiRouter.post('/seed', seedDatabase);
}

apiRouter.get("/", getApiEndpoints);

module.exports = apiRouter;
