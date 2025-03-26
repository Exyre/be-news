const db = require("../db/connection")
const { fetchAllTopics, insertTopic } = require("../Models/topics.model")

function getAllTopics(req, res, next) {
    fetchAllTopics()
        .then((topics) => {
            res.status(200).send({ topics })
        })
        .catch(next)
    }

function postTopic(req, res, next) {
    const { slug, description } = req.body;

    insertTopic(slug, description)
        .then((topic) => {
            res.status(201).send({ topic });
        })
        .catch(next);
}

module.exports = { getAllTopics, postTopic };