var secrets = require('./secure/credentials')
var config = {};

const DBNAME = "bossa";
const DBURL = "mongodb://127.0.0.1:27017";

config.mongoURI = {
  dev: 'mongodb://127.0.0.1:27017',
  automated_test: 'mongodb://127.0.0.1:27018',
  test: 'mongodb://mongo-uat:27018',
  stage: 'mongodb://mongo-stage:27019',
  prod: 'mongodb://mongo-prod:27020'
};

config.secrets = {
  dev: {api_key: secrets.API_KEY_TEST_SHOP, api_pass: secrets.API_KEY_TEST_SHOP},
  automated_test: {api_key: secrets.API_KEY_TEST_SHOP, api_pass: secrets.API_PASS_TEST_SHOP},
  test: {api_key: secrets.API_KEY_TEST_SHOP, api_pass: secrets.API_PASS_TEST_SHOP},
  stage: {api_key: secrets.API_KEY_TEST_SHOP, api_pass: secrets.API_PASS_TEST_SHOP},
  prod: {api_key: secrets.API_KEY, api_pass: secrets.API_PASS}
}
config.baseUrl = {
  dev: 'https://bossaonline-test.myshopify.com/admin',
  automated_test: 'https://bossaonline-test.myshopify.com/admin',
  test: 'https://bossaonline-test.myshopify.com/admin',
  stage: 'https://bossaonline-test.myshopify.com/admin',
  prod: 'https://bossa-online.myshopify.com/admin'
}
module.exports = config;
