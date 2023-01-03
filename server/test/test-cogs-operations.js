var wtf = require('wtfnode');
const R = require('ramda')
var chai = require('chai');
var data = require('./product-data')
const purchase_order_data = require('./static-data/purchase-order-data.js')
const cogs_data = require('./static-data/cogs-data.js')
var conn = require('../routes/db.helper')
var t = require('../routes/api.connect')
const moment = require('moment')
var constants = require('../routes/api.constants')
chai.use(require('chai-datetime'));
var should = chai.should();
const expect = require('chai').expect
chai.expect();


//chai.use(chaiHttp);
process.env.NODE_ENV = 'automated_test';

describe('[COGS Operations Test Cases]', function() {

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

  describe('Get Product By ID', function() {

    beforeEach('Prep database with product record', (done) => {
      conn.connect()
        .then((database) => {
          db = database;
          db.collection(conn.PRODUCTS).deleteMany({})
            .then((err) => {
              db.collection(conn.PRODUCTS).insertAsync(data.products_3)
                .then((obj) => {
                  done();
                })
            });
        });
    });


    this.timeout(4000)

    // Look how interesting. If we pass done to it(desc, function(done)) the test never finishes. It hangs. If you don't pass "done", it works.
    it('Test getProductById', () => {
      return t.getProductById(data.products_3[0].id)
        .then((result) => {
          should.exist(result);
          result.id.should.equal(11362986452)
          result.product.id.should.equal(11362986452)
        })
    })

    //"cogs": [
    // {
    //     "dateFrom": moment().subtract(20, 'days').startOf('day').toDate(),
    //     "dateTo": moment().subtract(10, 'days').startOf('day').toDate(),
    //     "costSourceCurrency": 1,
    //     "cost": 1,
    //     "handlingCost": 1,
    //     "exchangeRate": 1
    // },
    describe('COGS creation', function() {

      const cogs = t.prepareCOGSFromPurchaseOrder(purchase_order_data.orderWithNewProduct)

      it('New COGS entry is populate when zero COGS records exist for a product', (done) => {
        var r = t.addCOGSToVariant(123, 456, cogs)
        r.product_id.should.equal(123)
        r.variant_id.should.equal(456)
        r.should.have.property('cogs')
        r.cogs[0].cost_in_real.should.equal(12)
        r.cogs[0].cost_in_aud.should.equal(8.2176)
        r.cogs[0].exchange_rate.should.equal(0.68)
        r.cogs[0].handling_cost.should.equal(1)
        r.cogs[0].date_to.should.equalDate(moment(constants.END_OF_TIMES).toDate())
        done()
      })

    })

    describe('Test COGS list manipulation functions', function() {

      const COGSToInsert = {
        date_from: moment().startOf('day').toDate(),
        date_to: moment(constants.END_OF_TIMES).toDate(),
        cost_in_real: 1,
        cost_in_aud: 1,
        handling_cost: 1,
        exchange_rate: 1
      }

      const COGSList = [{
        date_from: moment().subtract(20, 'days').startOf('day').toDate(),
        date_to: moment(constants.END_OF_TIMES).toDate(),
        cost_in_real: 10,
        cost_in_aud: 10,
        handling_cost: 10,
        exchange_rate: 10
      }]


      it('Should insert COGS into an existing list', function(done) {
        const newCOGSList = t.insertCOGSRecord(COGSList, COGSToInsert)
        console.log(newCOGSList)
        newCOGSList.should.have.lengthOf(2)
        newCOGSList[1].date_from.should.have.equalDate(moment().startOf('day').toDate())
        newCOGSList[1].cost_in_real.should.equal(1)
        newCOGSList[1].cost_in_aud.should.equal(1)
        newCOGSList[1].exchange_rate.should.equal(1)
        newCOGSList[1].handling_cost.should.equal(1)
        newCOGSList[1].date_to.should.equalDate(moment(constants.END_OF_TIMES).toDate())
        done()
      })

      it('Should fix date_to', function(done) {
        const mergedList = t.insertCOGSRecord(COGSList, COGSToInsert)
        const dateCorrectedList = R.mapAccumRight(t.setDateAsPrevious, -1, mergedList)[0]
        console.log('Corrected list ', dateCorrectedList)
        dateCorrectedList.should.have.lengthOf(2)
        dateCorrectedList[0].date_to.should.have.equalDate(moment().subtract(1, 'days').startOf('day').toDate())
        dateCorrectedList[1].date_from.should.have.equalDate(moment().startOf('day').toDate())
        dateCorrectedList[1].date_to.should.equalDate(moment(constants.END_OF_TIMES).toDate())
        done()
      })
    })

    describe('Insert a product', function() {
      beforeEach('Prep database with product record', (done) => {
        conn.connect()
          .then((database) => {
            db = database;
            db.collection(conn.PRODUCTS).deleteMany({})
              .then((res) => {
                done();
              });
          });
      });

      it('Should insert a new product', (done) => {
        t.getProductById(data.product_4.id).then((x) => {
          expect(x).to.be.null
          t.upsertProduct(data.product_4)
            .then((result) => {
              console.log("HERE I AM")
              console.log("result: ", result)
              console.log("Searching for ID ", data.product_4.id)
              t.getProductById(data.product_4.id)
                .then((d) => {
                  expect(d).not.to.be.null
                  d.should.have.property('id')
                  d.id.should.equal(data.product_4.id)
                  d.variants.should.be.an("array")
                  done()
                })

            })
        })
      })
    })

    describe('Update a product', function() {
      beforeEach('Prep database with product record', (done) => {
        conn.connect()
          .then((database) => {
            db = database;
            db.collection(conn.PRODUCTS).deleteMany({})
              .then((res) => {
                t.upsertProduct(data.product_4)
                  .then((res) => {
                    done();
                  })
              });
          });
      });

      it('Should update an existing product', (done) => {
        t.getProductById(data.product_4.id).then((x) => {
          x.id.should.equal(data.product_4.id)
          x.test_field.should.equal("initial value")

          const modifiedProduct = { ...data.product_4, test_field: "new value" }
          t.upsertProduct(modifiedProduct)
            .then((result) => {
              t.getProductById(modifiedProduct.id)
                .then((d) => {
                  d.should.have.property('id')
                  d.id.should.equal(modifiedProduct.id)
                  console.log("HERE I AM")
                  d.test_field.should.equal("new value")
                  d.variants.should.be.an("array")
                  done()
                })
            })
        })
      })
    })

    describe('Insert COGS', function() {
      beforeEach('Prep database with product record', (done) => {
        conn.connect()
          .then((database) => {
            db = database;
            db.collection(conn.COGS).deleteMany({})
              .then((res) => {
                done();
              });
          });
      });

      it('upsertCOGS Should insert a new COGS record', (done) => {
        const cogs = { product_id: data.product_4.id, variant_id: data.product_4.variants[0].id, cogs: [{ test: "initial value" }] }
        t.getCOGSById(cogs.product_id, cogs.variant_id).then((x) => {
          expect(x).to.be.null
          t.upsertCOGS(cogs)
            .then((result) => {
              console.log("result: ", result)
              console.log("Searching for ID ", cogs.product_id)
              t.getCOGSById(cogs.product_id, cogs.variant_id)
                .then((d) => {
                  expect(d).not.to.be.null
                  d.should.have.property('_id')
                  d.should.have.property('product_id')
                  d.product_id.should.equal(cogs.product_id)
                  d.cogs.should.be.an("array")
                  done()
                })

            })
        })
      })

      it('HandleCOGS should insert a new COGS record when none exists', (done) => {
        const product_id = data.product_4.id
        const variant_id = data.product_4.variants[0].id
        t.getCOGSById(product_id, variant_id).then((x) => {
          expect(x).to.be.null
          t.handleCOGS(product_id, variant_id, purchase_order_data.orderWithNewProduct)
            .then((result) => {
              t.getCOGSById(product_id, variant_id)
                .then((d) => {
                  expect(d).not.to.be.null
                  d.should.have.property('_id')
                  d.should.have.property('product_id')
                  d.product_id.should.equal(product_id)
                  d.cogs.should.be.an("array")
                  done()
                })

            })
        })
      })

      describe('COGS', function() {
        beforeEach('Prep database with product record', (done) => {
          conn.connect()
            .then((database) => {
              db = database;
              t.upsertCOGS(cogs_data.cogs_1)
                .then((res) => {
                  done();
                });
            });
        });

        it('HandleCOGS should update COGS record when one exists', (done) => {
          const product_id = cogs_data.cogs_1.product_id
          const variant_id = cogs_data.cogs_1.variant_id
          t.getCOGSById(product_id, variant_id).then((x) => {
            expect(x).not.to.be.null
            t.handleCOGS(product_id, variant_id, purchase_order_data.orderWithNewProduct)
              .then((result) => {
                t.getCOGSById(product_id, variant_id)
                  .then((d) => {
                    expect(d).not.to.be.null
                    d.cogs.should.be.an("array")
                    d.cogs.should.have.lengthOf(3)
                    console.log(d.cogs)
                    d.cogs[0].date_from.should.have.equalDate(moment('2017-06-04').startOf('day').toDate())
                    d.cogs[0].date_to.should.have.equalDate(moment('2017-06-23').startOf('day').toDate())
                    d.cogs[1].date_from.should.have.equalDate(moment('2017-06-24').startOf('day').toDate())
                    d.cogs[1].date_to.should.have.equalDate(moment().subtract('days', 1).startOf('day').toDate())
                    d.cogs[2].date_from.should.have.equalDate(moment().startOf('day').toDate())
                    d.cogs[2].date_to.should.have.equalDate(moment(constants.END_OF_TIMES).startOf('day').toDate())
                    d.cogs[2].cost_in_real.should.equal(purchase_order_data.orderWithNewProduct.cost_in_real)
                    d.cogs[2].cost_in_aud.should.equal(purchase_order_data.orderWithNewProduct.cost_in_aud)
                    d.cogs[2].exchange_rate.should.equal(purchase_order_data.orderWithNewProduct.exchange_rate)
                    d.cogs[2].handling_cost.should.equal(1)
                    d.should.have.property('_id')
                    d.should.have.property('product_id')
                    d.should.have.property('variant_id')
                    d.product_id.should.equal(product_id)
                    d.variant_id.should.equal(variant_id)
                    done()
                  })

              })
          })
        })
      })
    })

  })


});
