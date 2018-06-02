var config = {};

const DBNAME = "bossa";
const DBURL = "mongodb://127.0.0.1:27017";

config.mongoURI = {
  dev: 'mongodb://127.0.0.1:27017',
  test: 'mongodb://127.0.0.1:27018'
};

module.exports = config;
