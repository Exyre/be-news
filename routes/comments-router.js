const express = require("express");
const commentsRouter = express.Router();

const { removeCommentById } = require("../Controllers/comments.controller");

commentsRouter.delete("/:comment_id", removeCommentById);

module.exports = commentsRouter;