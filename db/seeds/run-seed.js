const devData = require('../data/development-data/index.js');
const seed = require('./seed.js');
const db = require('../connection.js');

const runSeed = () => {
  return seed(devData).then(() => {
    if (process.env.NODE_ENV !== 'production') {
      return db.end();
    }
  });
};

runSeed();
