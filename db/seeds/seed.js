const db = require("../connection")
const format = require('pg-format');
const { convertTimestampToDate } = require('./utils'); 

const seed = async ({ topicData, userData, articleData, commentData }) => {
  try {
    await db.query(`
      DROP TABLE IF EXISTS comments;
      DROP TABLE IF EXISTS articles;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS topics;
      `)
      
    await db.query(`
      CREATE TABLE topics (
        slug VARCHAR PRIMARY KEY,
        description VARCHAR(255),
        img_url VARCHAR(1000)
      );
    `);
    
      
    await db.query(`
      CREATE TABLE users (
        username VARCHAR PRIMARY KEY,
        name VARCHAR,
        avatar_url VARCHAR(1000)
      );
    `);
    
    
    await db.query(`
      CREATE TABLE articles (
        article_id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        topic VARCHAR REFERENCES topics(slug) NOT NULL,
        author VARCHAR REFERENCES users(username) NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        votes INT DEFAULT 0,
        article_img_url VARCHAR(1000)
      );
    `);

      
    await db.query(`
      CREATE TABLE comments (
        comment_id SERIAL PRIMARY KEY,
        article_id INT REFERENCES articles(article_id),
        body TEXT NOT NULL,
        votes INT DEFAULT 0,
        author VARCHAR REFERENCES users(username) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
      
    const topicValues = topicData
      .map(
        (topic) => [topic.slug, topic.description, topic.img_url]
      )
    const topicQuery = format(
      `INSERT INTO topics (slug, description, img_url) VALUES %L`,
      topicValues
    )
    await db.query(topicQuery);
      
      
    const userValues = userData
      .map(
        (user) => [user.username, user.name, user.avatar_url]
      )
      const userQuery = format(
      `INSERT INTO users (username, name, avatar_url) VALUES %L`,
      userValues
      )
      await db.query(userQuery)
      
      
    const articleValues = articleData.map((article) => {
      const { created_at, ...otherArticleProps } = article;
      const formattedArticle = convertTimestampToDate({ created_at, ...otherArticleProps });

      return [
        formattedArticle.title,
        formattedArticle.topic,
        formattedArticle.author,
        formattedArticle.body,
        formattedArticle.created_at,
        formattedArticle.votes ?? 0,
        formattedArticle.article_img_url
      ];
    });

    const articleQuery = format(`
      INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url) VALUES %L
    `, articleValues);

    await db.query(articleQuery)

    const { rows: articles } = await db.query (`SELECT article_id, title FROM articles`);
    const articleIdMap = Object.fromEntries(articles.map(({article_id, title}) => [title, article_id]))
      
      const commentValues = commentData.map(comment => [
        articleIdMap[comment.article_title],
        comment.body,
        comment.author,
        new Date(comment.created_at).toISOString(), 
        comment.votes ?? 0
      ]);

      await db.query(format(`
        INSERT INTO comments (article_id, body, author, created_at, votes) 
        VALUES %L
        `, commentValues));

    } catch(err) {
       console.error("Error inserting comment:", err);
    }
  };
            ;
      
      

module.exports = seed;
