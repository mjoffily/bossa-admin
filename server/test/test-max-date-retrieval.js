const order_data = require('./static-data/sell-order-data')
const product_data = require('./product-data')
var conn = require('../routes/db.helper')
var t = require('../routes/api.connect')
var constants = require('../routes/api.constants')
var wtf = require('wtfnode');
const R = require('ramda')
var chai = require('chai');
const moment = require('moment')
chai.use(require('chai-datetime'));
var should = chai.should();
chai.expect();


process.env.NODE_ENV = 'automated_test';

describe('[Test some mongodb manipulation functions]', function() {

  var db;

  after(() => {
    conn.close()
      .then((obj) => {
        wtf.dump()
      })
      .catch((err) => {
        wtf.dump()
      })
  })

  describe('[Test retrieval of MAX date for ORDERS Synch when there are no orders]', function() {

    beforeEach('Prep database by adding deleting all orders', (done) => {
      conn.connect()
        .then((database) => {
          db = database;
          db.collection(conn.ORDERS).deleteMany({})
            .then((data) => {
              done();
            });
        });
    });

    it('Test get max product date when there are no orders in the database', () => {
      return t.getMaxOrderUpdatedDate()
        .then((maxdate) => {
          should.exist(maxdate);
          maxdate.should.have.equalDate(constants.BEGIN_OF_TIMES)
          maxdate.should.have.equalTime(constants.BEGIN_OF_TIMES)
        })
    })

  })

  describe('[Test retrieval and update of MAX date for Order Synch]', function() {

    beforeEach('Prep database by adding a few orders', (done) => {
      conn.connect()
        .then((database) => {
          db = database;
          db.collection(conn.ORDERS).deleteMany({})
            .then((data) => {
              db.collection(conn.ORDERS).insertAsync(order_data.SELL_ORDERS_BASIC)
                .then(insertedData => {
                  done();
                })
            });
        });
    });

    const dateToVerify = moment('2018-12-26').startOf('day').toDate()

    // Look how interesting. If we pass done to it(desc, function(done)) the test never finishes. It hangs. If you don't pass "done", it works.
    it('Test get max order date', () => {
      return t.getMaxOrderUpdatedDate()
        .then((maxdate) => {
          should.exist(maxdate);
          maxdate.should.have.equalDate(dateToVerify)
        })
    })

    it('Test update max order date in lastupdate collection', () => {
      return t.updateLastOrderUpdateDate()
        .then((result) => {
          var d = new Date()
          console.log('test results: ' + moment(result.last_refresh).format('YYYY-MM-DD HH:mm:ss +-HH:mm'))
          result.last_refresh.should.have.equalDate(dateToVerify)
        });
    })
  })

  describe('[Test retrieval and update of MAX date for PRODUCT Synch]', function() {

    beforeEach('Prep database by adding a few products', (done) => {
      conn.connect()
        .then((database) => {
          db = database;
          db.collection(conn.PRODUCTS).deleteMany({})
            .then((data) => {
              db.collection(conn.PRODUCTS).insertAsync(product_data.products_1)
                .then(insertedData => {
                  done();
                })
            });
        });
    });

    const dateToVerify = moment('2018-05-28 09:55:00').toDate()

    // Look how interesting. If we pass done to it(desc, function(done)) the test never finishes. It hangs. If you don't pass "done", it works.
    it('Test get max product date', () => {
      return t.getMaxProductUpdatedDate()
        .then((maxdate) => {
          should.exist(maxdate);
          maxdate.should.have.equalDate(dateToVerify)
          maxdate.should.have.equalTime(dateToVerify)
        })
    })

    it('Test update max product date in lastupdate collection', () => {
      return t.updateLastProductUpdateDate()
        .then((result) => {
          result.last_refresh.should.have.equalDate(dateToVerify)
          result.last_refresh.should.have.equalTime(moment(dateToVerify).add(1, "second").toDate())
        });
    })
  })

  describe('[Test retrieval of MAX date for PRODUCT Synch when there are no products]', function() {

    beforeEach('Prep database by adding deleting all products', (done) => {
      conn.connect()
        .then((database) => {
          db = database;
          db.collection(conn.PRODUCTS).deleteMany({})
            .then((data) => {
              done();
            });
        });
    });

    // Look how interesting. If we pass done to it(desc, function(done)) the test never finishes. It hangs. If you don't pass "done", it works.
    it('Test get max product date when there are no products in the database', () => {
      return t.getMaxProductUpdatedDate()
        .then((maxdate) => {
          should.exist(maxdate);
          maxdate.should.have.equalDate(constants.BEGIN_OF_TIMES)
          maxdate.should.have.equalTime(constants.BEGIN_OF_TIMES)
        })
    })

  })

  describe('[Test count orders function]', function() {

    beforeEach('Prep database by adding a few orders', (done) => {
      conn.connect()
        .then((database) => {
          db = database;
          db.collection(conn.ORDERS).deleteMany({})
            .then((data) => {
              db.collection(conn.ORDERS).insertAsync(order_data.SELL_ORDERS_BASIC)
                .then(insertedData => {
                  done();
                })
            });
        });
    });

    // Look how interesting. If we pass done to it(desc, function(done)) the test never finishes. It hangs. If you don't pass "done", it works.
    it('Test count orders works', () => {
      return t.countOrders()
        .then((numOrders) => {
          should.exist(numOrders);
          numOrders.should.be.equal(3)
        })
    })

  })

});
