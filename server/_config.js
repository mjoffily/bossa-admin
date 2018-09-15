var secrets = require('./secure/credentials')
var config = {};

const DBNAME = "bossa";
const DBURL = "mongodb://127.0.0.1:27017";

config.mongoURI = {
  dev: 'mongodb://127.0.0.1:27017',
  test: 'mongodb://127.0.0.1:27018'
};

config.secrets = {
  dev: {api_key: secrets.API_KEY, api_pass: secrets.API_PASS},
  test: {api_key: secrets.API_KEY_TEST_SHOP, api_pass: secrets.API_PASS_TEST_SHOP}
}
config.baseUrl = {
  dev: 'https://bossa-online.myshopify.com/admin',
  test: 'https://bossaonline-test.myshopify.com/admin'
}
module.exports = config;
