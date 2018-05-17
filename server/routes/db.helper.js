var Promise = require('bluebird');
var MongoDB = require('mongodb');
var MongoClient = MongoDB.MongoClient;
var Collection = MongoDB.Collection;

Promise.promisifyAll(MongoDB);
Promise.promisifyAll(Collection.prototype);
Promise.promisifyAll(MongoClient);

const DBNAME = "bossa";
const DBURL = "mongodb://127.0.0.1:27017";

const PRODUCTS = "products";
const USERS = "users";
const ORDERS = "orders";
const PURCHASE_ORDERS = "purchase_orders";
const COUNTERS = "counters";
const REQUESTS = "requests";
const LAST_UPDATE = "lastupdate";
const COGS = [{dateFrom: new Date("2000-01-01"), dateTo: new Date("9999-01-01") ,costSourceCurrency: 0.00, cost: 0.00, handlingCost: 0.00, exchangeRate: 0.00}];

var myDb;


function connect() {
  return new Promise(function (resolve, reject) {
    if (myDb === undefined) {
      MongoClient.connectAsync(DBURL).then(function(client) {
        myDb = client.db(DBNAME);
        resolve(myDb);
      })
      .catch(function(err) {
        reject(err);
      });  
    } else {
      resolve(myDb);
    }
  });
}

module.exports = {connect: connect
, USERS: USERS
, PRODUCTS: PRODUCTS
, ORDERS: ORDERS
, PURCHASE_ORDERS: PURCHASE_ORDERS
, COUNTERS: COUNTERS
, REQUESTS: REQUESTS
, LAST_UPDATE: LAST_UPDATE
, COGS: COGS
};