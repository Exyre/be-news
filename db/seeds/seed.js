const db = require("../connection")
const format = require('pg-format');
const { convertTimestampToDate } = require('./utils'); 

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db.query(`
    DROP TABLE IF EXISTS comments;
    DROP TABLE IF EXISTS articles;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS topics;
    `)
    .then(() => {
      return db.query(`
        CREATE TABLE topics (
          slug VARCHAR PRIMARY KEY,
          description VARCHAR(255),
          img_url VARCHAR(1000)
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE users (
          username VARCHAR PRIMARY KEY,
          name VARCHAR,
          avatar_url VARCHAR(1000)
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE articles (
          article_id SERIAL PRIMARY KEY,
          title VARCHAR NOT NULL,
          topic VARCHAR REFERENCES topics(slug),
          author VARCHAR REFERENCES users(username),
          body TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          votes INT DEFAULT 0,
          article_img_url VARCHAR(1000)
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE comments (
          comment_id SERIAL PRIMARY KEY,
          article_id INT REFERENCES articles(article_id),
          body TEXT NOT NULL,
          votes INT DEFAULT 0,
          author VARCHAR REFERENCES users(username),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    })
    .then(() => {
      const topicValues = topicData
        .map(
          (topic) => [topic.slug, topic.description, topic.img_url]
        )
        const topicQuery = format(
          `INSERT INTO topics (slug, description, img_url) VALUES %L`,
          topicValues
        )
      return db.query(topicQuery);
    }) 
    .then(() => {
      const userValues = userData
        .map(
          (user) => [user.username, user.name, user.avatar_url]
        )
        const userQuery = format(
        `INSERT INTO users (username, name, avatar_url) VALUES %L`,
        userValues
        )
        return db.query(userQuery)
    })
    .then(() => {
  const articleValues = articleData.map((article) => {
    const { created_at, ...otherArticleProps } = article;
    const formattedArticle = convertTimestampToDate({ created_at, ...otherArticleProps });

    return [
      formattedArticle.title,
      formattedArticle.topic,
      formattedArticle.author,
      formattedArticle.body,
      formattedArticle.created_at,
      formattedArticle.votes,
      formattedArticle.article_img_url
    ];
  });

  const articleQuery = format(`
    INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url) VALUES %L
  `, articleValues);

  return db.query(articleQuery)
    })
    .then(() => {
      return Promise.all(
        commentData.map((comment) => {
          return db.query(
            `SELECT article_id FROM articles WHERE title = $1`,
            [comment.article_title]
          )
            .then(({ rows }) => {
              if (rows.length === 0) {
                console.log(`No article found for comment with title: ${comment.article_title}`);
                return; 
              }

              const article_id = rows.article_id;

              const commentValues = [
                article_id,
                comment.body,
                comment.author,
                new Date(comment.created_at).toISOString(), 
                comment.votes
              ];

              return db.query(format(`
                INSERT INTO comments (article_id, body, author, created_at, votes) 
                VALUES %L
              `, [commentValues]));
            })
            .catch((err) => {
              console.error("Error inserting comment:", err);
            });
        })
      );
    })
  };

module.exports = seed;
