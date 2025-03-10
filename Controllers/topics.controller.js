const db = require("../db/connection")
const { fetchAllTopics } = require("../Models/topics.model")

function getAllTopics(req, res, next) {
    fetchAllTopics()
        .then((topics) => {
            res.status(200).send({ topics })
        })
        .catch(next)
    }
module.exports = { getAllTopics };