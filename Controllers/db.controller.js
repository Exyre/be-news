const { seed } = require('../db/seeds/seed');
const devData = require('../db/data/development-data');

exports.seedDatabase = async (req, res, next) => {
  try {
    await seed(devData);
    res.status(200).send({ msg: 'Database seeded successfully' });
  } catch (err) {
    next(err);
  }
}; 