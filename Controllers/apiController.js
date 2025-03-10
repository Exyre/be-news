const db = require("../db/connection");
const endpointsJson = require("../endpoints.json");

function getApiEndpoints(req, res, next) {
    res.status(200).json(endpointsJson)
};

module.exports = { getApiEndpoints }