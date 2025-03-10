const express = require("express");
const app = express();

const { getApiEndpoints } = require("./Controllers/apiController");
const { getAllTopics } = require("./Controllers/topics.controller");

app.use(express.json());

app.get("/api", getApiEndpoints);

app.get("/api/topics", getAllTopics);

app.use((err, req, res, next) => {
    if(err.status) {
        res.status(err.status).send({ msg: err.msg })
    } else {
        console.log(err);
        res.status(500).send({ msg: "Internal Server Error" })
    }
})

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

module.exports = app