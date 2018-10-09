var R = require('ramda')
var secrets = require('./secure/credentials')
var config = {};

const env = R.defaultTo('dev', process.env.NODE_ENV);

// This is used so the batch docker container can call 
// the application's API
config.appBaseURI = {
  dev: 'localhost:8080/api',
  automated_test: 'localhost:8080/api',
  test: 'bossa-admin-uat:3000/api',
  stage: 'localhost:3000/api',
  //stage: 'bossa-admin-stage:3000/api',
  prod: 'bossa-admin-prod:3000/api'
};

config.localURLS = {
  loginURL: `http://${config.appBaseURI[env]}/login`,
  localSellOrderCountURL: `http://${config.appBaseURI[env]}/sell-order-count-local`,
}

config.secrets = {
  dev: {batch_user: secrets.BATCH_USER_DEV, batch_pwd: secrets.BATCH_PWD_DEV},
  automated_test: {batch_user: secrets.BATCH_USER_TEST, batch_pwd: secrets.BATCH_PWD_TEST},
  test: {batch_user: secrets.BATCH_USER_TEST, batch_pwd: secrets.BATCH_PWD_TEST},
  stage: {batch_user: secrets.BATCH_USER_STAGE, batch_pwd: secrets.BATCH_PWD_STAGE},
  prod: {batch_user: secrets.BATCH_USER_PROD, batch_pwd: secrets.BATCH_PWD_PROD}
}

config.getSecret = function(name) {
  const env = R.defaultTo('dev', process.env.NODE_ENV);
  return config.secrets[env][name];
}

module.exports = config;
