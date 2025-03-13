const express = require("express");
const commentsRouter = express.Router();

const { removeCommentById, updateCommentVotes } = require("../Controllers/comments.controller");

commentsRouter.delete("/:comment_id", removeCommentById,);
commentsRouter.patch("/:comment_id", updateCommentVotes);

module.exports = commentsRouter;