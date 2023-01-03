var R = require('ramda')
var log = require('loglevel');
var secrets = require('./secure/credentials')
var config = {};
config.log = log;
config.log.setLevel('debug', false)

config.log.debug('NODE ENVVV: %s', process.env.NODE_ENV);
config.env = R.defaultTo('dev', process.env.NODE_ENV);
config.log.debug('Environment: %s', config.env);

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

config.localURLS = {
  loginURL: `http://${config.appBaseURI[config.env]}/login`,
  localSellOrderCountURL: `http://${config.appBaseURI[config.env]}/sell-order-count-local`,
}

config.secrets = {
  dev: {
    api_key: secrets.API_KEY_TEST_SHOP,
    api_pass: secrets.API_KEY_TEST_SHOP,
    db_user: '',
    db_pwd: '',
    batch_user: secrets.BATCH_USER_DEV,
    batch_pwd: secrets.BATCH_PWD_DEV,
    twilio_user: secrets.TWILIO_USER_PROD,
    twilio_token: secrets.TWILIO_TOKEN_PROD,
    twilio_mobile: secrets.TWILIO_MOBILE,
    sms_to: secrets.SMS_TO,
    mobile_D: secrets.mobile_D
  },
  automated_test: {
    api_key: secrets.API_KEY_TEST_SHOP,
    api_pass: secrets.API_PASS_TEST_SHOP,
    db_user: '',
    db_pwd: '',
    batch_user: secrets.BATCH_USER_TEST,
    batch_pwd: secrets.BATCH_PWD_TEST,
    twilio_user: secrets.TWILIO_USER_PROD,
    twilio_token: secrets.TWILIO_TOKEN_PROD,
    twilio_mobile: secrets.TWILIO_MOBILE,
    sms_to: secrets.SMS_TO,
    mobile_D: secrets.mobile_D
  },
  test: {
    api_key: secrets.API_KEY_TEST_SHOP,
    api_pass: secrets.API_PASS_TEST_SHOP,
    db_user: secrets.DB_USER_TEST,
    db_pwd: secrets.DB_PWD_TEST,
    batch_user: secrets.BATCH_USER_TEST,
    batch_pwd: secrets.BATCH_PWD_TEST,
    twilio_user: secrets.TWILIO_USER_PROD,
    twilio_token: secrets.TWILIO_TOKEN_PROD,
    twilio_mobile: secrets.TWILIO_MOBILE,
    sms_to: secrets.SMS_TO,
    mobile_D: secrets.mobile_D
  },
  stage: {
    api_key: secrets.API_KEY_STAGE_SHOP,
    api_pass: secrets.API_PASS_STAGE_SHOP,
    db_user: secrets.DB_USER_STAGE,
    db_pwd: secrets.DB_PWD_STAGE,
    batch_user: secrets.BATCH_USER_STAGE,
    batch_pwd: secrets.BATCH_PWD_STAGE,
    twilio_user: secrets.TWILIO_USER_PROD,
    twilio_token: secrets.TWILIO_TOKEN_PROD,
    twilio_mobile: secrets.TWILIO_MOBILE,
    sms_to: secrets.SMS_TO,
    mobile_D: secrets.mobile_D
  },
  prod: {
    api_key: secrets.API_KEY,
    api_pass: secrets.API_PASS,
    db_user: secrets.DB_USER_PROD,
    db_pwd: secrets.DB_PWD_PROD,
    batch_user: secrets.BATCH_USER_PROD,
    batch_pwd: secrets.BATCH_PWD_PROD,
    twilio_user: secrets.TWILIO_USER_PROD,
    twilio_token: secrets.TWILIO_TOKEN_PROD,
    twilio_mobile: secrets.TWILIO_MOBILE,
    sms_to: secrets.SMS_TO,
    mobile_D: secrets.mobile_D
  }
}

config.shopifyBaseUrl = {
  dev: 'https://bossaonline-test.myshopify.com/admin',
  automated_test: 'https://bossaonline-test.myshopify.com/admin',
  test: 'https://bossaonline-test.myshopify.com/admin',
  stage: 'https://bossaonline-stage.myshopify.com/admin',
  prod: 'https://bossa-online.myshopify.com/admin'
}

config.getSecret = function(name) {
  return config.secrets[config.env][name];
}

module.exports = config;
