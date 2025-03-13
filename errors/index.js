exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    return res.status(err.status).send({ msg: err.msg });
  } else if (err.code === "22P02") {
    if (req.path.includes("/comments/")) {
      return res.status(400).send({ msg: "Invalid comment ID" });
    } else {
      return res.status(400).send({ msg: "Invalid article_id" });
    }
  } else if (err.code === "23502") {
    return res.status(400).send({ msg: "Bad request - missing required fields" });
  } else if (err.code === "23503") {
    return res.status(404).send({ msg: "Article not found or user does not exist" });
  } else {
    next(err);
  }
};

exports.handleServerErrors = (err, req, res, next) => {
  console.log(err); 
  res.status(500).send({ msg: "Internal Server Error" });
};

