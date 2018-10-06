const order_data = require('./static-data/sell-order-data')
var conn = require('../routes/db.helper')
var t = require('../routes/api.connect')
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
          console.log('xxx: ' + moment(d).format())
          console.log('test resultss: ' + moment(result.last_refresh).format('YYYY-MM-DD HH:mm:ss +-HH:mm'))
          result.last_refresh.should.have.equalDate(dateToVerify)
        });
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
