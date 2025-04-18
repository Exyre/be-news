const express = require("express");
const commentsRouter = express.Router();

const { removeCommentById, updateCommentVotes, updateCommentBody } = require("../Controllers/comments.controller");

commentsRouter.delete("/:comment_id", removeCommentById);
commentsRouter.patch("/:comment_id", updateCommentVotes);
commentsRouter.patch("/:comment_id/body", updateCommentBody);

module.exports = commentsRouter;