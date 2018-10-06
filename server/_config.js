var R = require('ramda')

var secrets = require('./secure/credentials')
var config = {};

const DBNAME = "bossa";
const DBURL = "mongodb://127.0.0.1:27017";

config.mongoURI = {
  dev: '127.0.0.1:27017',
  automated_test: '127.0.0.1:27018',
  test: 'mongo-uat:27017/bossa',
  stage: 'mongo-stage:27017/bossa',
  prod: 'mongo-prod:27017/bossa'
};

// This is used so the batch docker container can call 
// the application's API
config.appBaseURI = {
  dev: 'localhost:8080/api',
  automated_test: 'localhost:8080/api',
  test: 'bossa-admin-uat:3000/api',
  stage: 'bossa-admin-stage:3000/api',
  prod: 'bossa-admin-prod:3000/api'
};


config.secrets = {
  dev: {api_key: secrets.API_KEY_TEST_SHOP, api_pass: secrets.API_KEY_TEST_SHOP, db_user: '', db_pwd: '', batch_user: secrets.BATCH_USER_DEV, batch_pwd: secrets.BATCH_PWD_DEV},
  automated_test: {api_key: secrets.API_KEY_TEST_SHOP, api_pass: secrets.API_PASS_TEST_SHOP, db_user: '', db_pwd: '', batch_user: secrets.BATCH_USER_TEST, batch_pwd: secrets.BATCH_PWD_TEST},
  test: {api_key: secrets.API_KEY_TEST_SHOP, api_pass: secrets.API_PASS_TEST_SHOP, db_user: secrets.DB_USER_TEST, db_pwd: secrets.DB_PWD_TEST, batch_user: secrets.BATCH_USER_TEST, batch_pwd: secrets.BATCH_PWD_TEST},
  stage: {api_key: secrets.API_KEY_STAGE_SHOP, api_pass: secrets.API_PASS_STAGE_SHOP, db_user: secrets.DB_USER_STAGE, db_pwd: secrets.DB_PWD_STAGE, batch_user: secrets.BATCH_USER_STAGE, batch_pwd: secrets.BATCH_PWD_STAGE},
  prod: {api_key: secrets.API_KEY, api_pass: secrets.API_PASS, db_user: secrets.DB_USER_PROD, db_pwd: secrets.DB_PWD_PROD, batch_user: secrets.BATCH_USER_PROD, batch_pwd: secrets.BATCH_PWD_PROD}
}

config.shopifyBaseUrl = {
  dev: 'https://bossaonline-test.myshopify.com/admin',
  automated_test: 'https://bossaonline-test.myshopify.com/admin',
  test: 'https://bossaonline-test.myshopify.com/admin',
  stage: 'https://bossaonline-stage.myshopify.com/admin',
  prod: 'https://bossa-online.myshopify.com/admin'
}

config.getSecret = function(name) {
  console.log("Getting secret for variable %s", name);
  console.log('NODE ENV: %s', process.env.NODE_ENV);
  const env = R.defaultTo('dev', process.env.NODE_ENV);
  console.log('this is the secrete %s', JSON.stringify(config.secrets));
  console.log('this is ENV %s', env);
  console.log('this is the secrete %s', config.secrets[env][name]);
  return config.secrets[env][name];

}
module.exports = config;
