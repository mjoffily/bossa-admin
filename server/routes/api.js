'use strict';

var express = require('express');
var router = express.Router();
var conn = require('./api.connect');
var shopify = require('./api.shopify');
var helper = require('./api.helper');
var constants = require('./api.constants');
var auth = require('../login/jwt');
var login = require('../login/check-user');
var R = require('ramda')
const inventory = require('./product-inventory/product-inventory');




router.get('/', (req, res) => {
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>Lucas is watching!</Message>
</Response>`);
});

router.get('/test', auth.verifyToken, (req, res) => {

  res.send({ auth: true, error_msg: '' });
});

router.post('/login', (req, res) => {
  console.log("[login] - START");
  const { userid, password } = req.body;
  if (!userid) {
    res.status(400).json({ error: { msg: 'User is required' } });
    return;
  }

  if (!password) {
    res.status(400).json({ error: { msg: 'Password is required' } });
    return;
  }
  login.checkPassword(userid, password)
    .then((match) => {
      auth.encodeToken({ data: { userid } })
        .then((token) => { res.status(200).json({ data: { status: true, error_msg: '', token } }) })
        .catch((err) => { res.status(500).json({ data: { status: false, error_msg: 'internal system error' } }) })
    })
    .catch(err => {
      if (err.status) {
        const { error_msg } = err;
        res.status(200).json({ data: { status: false, error_msg } });
      }
      else {
        res.status(500).json({ data: { status: false, error_msg: 'internal system error' } });
      }
    });
})


router.get('/products-local', auth.verifyToken, (req, res) => {
  conn.getProductsLocal()
    .then(data => {
      res.status(200).json(data);
    })
    .catch(error => {
      res.status(500).send(error)
    });
});

router.get('/products-minimum', auth.verifyToken, (req, res) => {
  conn.getProductsLocalMin()
    .then(data => {
      res.status(200).json(data);
    })
    .catch(error => {
      res.status(500).send(error)
    });
});

router.get('/orders-local', auth.verifyToken, (req, res) => {
  conn.getOrdersLocal()
    .then(data => {
      res.status(200).json(data);
    })
    .catch(error => {
      res.status(500).send(error)
    });
});

router.get('/sell-order-count-local', auth.verifyToken, (req, res) => {
  conn.countOrders()
    .then(data => {
      res.status(200).json(data);
    })
    .catch(error => {
      res.status(500).send(error)
    });
});

router.get('/products/count/remote', auth.verifyToken, (req, res) => {
  shopify.countAllProducts()
    .then(data => {
      res.status(200).json(data);
    })
    .catch(error => {
      res.status(500).send(error)
    });
});

router.get('/orders/count/remote', auth.verifyToken, (req, res) => {
  shopify.countAllOrders()
    .then(data => {
      res.status(200).json(data);
    })
    .catch(error => {
      res.status(500).send(error)
    });
});



router.get('/products-to-be-synched', auth.verifyToken, (req, res) => {
  console.log("[route products-to-be-synched] - START");
  shopify.getProductsToSynch()
    .then(data => {
      var result = { totalProducts: data.length, products: data };
      res.status(200).json(result);
    })
    .catch(error => {
      console.log("[route products-to-be-synched] - ERROR");
      res.status(500).send("a server error has occurred processing your request.");
    });
});

router.get('/orders-to-be-synched', auth.verifyToken, (req, res) => {
  console.log("[route orders-to-be-synched] - START");
  shopify.getOrdersToSynch()
    .then(data => {
      var result = { totalOrders: data.length, orders: data };
      res.status(200).json(result);
    })
    .catch(error => {
      console.log("[route orders-to-be-synched] - ERROR");
      res.status(500).send("a server error has occurred processing your request.");
    });
});

router.get('/synch-products', auth.verifyToken, (req, res) => {
  shopify.getProductsToSynch()
    .then((products) => {
      const list = R.map(conn.upsertProduct)(products);
      Promise.all(list)
        .then(() => {
          conn.updateLastProductUpdateDate()
            .then((response) => {
              const msg = { totalProducts: products.length, result: "Success", max_update_date: response.last_refresh };
              if (products.length > 0) {
                helper.sendSMS(`SYNCH PRODUCTS\n\n${JSON.stringify(msg, null, 4)}`)
                  .then(message => {
                    res.status(200).json(msg);
                  })
                  .catch(error => {
                    // don't care much about SMS error. Proceed as success
                    console.log(error)
                    res.status(200).json(msg);
                  })
              }
              else {
                res.status(200).json(msg);
              }
            })
            .catch(error => {
              res.status(500).json(error);
            })
        })
        .catch((error) => {
          res.status(500).json(error);
        });
    })
    .catch(error => {
      res.status(500).json(error.message)
    });
});

router.put('/cogs', auth.verifyToken, (req, res) => {
  console.log("[route cogs] - START");
  console.log("this is req: %s", JSON.stringify(req.body));
  //var data = JSON.parse(req.body);
  console.log(JSON.stringify(req.body));
  var list = [];
  for (var i = 0, n = req.body.length; i < n; i++) {
    list.push(conn.putCOGS(req.body[i]));
  }
  Promise.all(list)
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(500).json(err.message);
    });
})

router.get('/purchase-orders', auth.verifyToken, (req, res) => {
  console.log("[GET purchase-orders] - START");
  conn.getPurchaseOrders()
    .then(data => {
      console.log(JSON.stringify(data, null, 4));
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(500).json(err.message);
    });
})

router.get('/purchase-order/:id', auth.verifyToken, (req, res) => {
  console.log("[GET purchase-order] - START");

  if (!req.params.id) {
    res.status(400).json({ message: "No purchase order id found" });
    return;
  }

  conn.getPurchaseOrder(req.params.id)
    .then(data => {
      console.log(JSON.stringify(data, null, 4));
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(500).json(err.message);
    });
})


router.post('/dummy/product', auth.verifyToken, (req, res) => {
  console.log('[/dummy/product] - START')
  shopify.addDummyProduct()
    .then(result => res.status(200).json(result))
    .catch(error => res.status(500).json(error));
})

router.get('/dummy/order', auth.verifyToken, (req, res) => {
  console.log('[/dummy/order] - START')
  shopify.addDummyOrder()
    .then(result => {
        console.log('Complete: %s', result)
        res.status(200).json(result)
    })
    .catch(error => res.status(500).json(error));
})

router.post('/purchase-order', auth.verifyToken, (req, res) => {
  console.log("[purchase-order] - START");
  console.log("this is req: %s", JSON.stringify(req.body));
  if (req.body._id) {
    res.status(400).json('_id field must not exist to post a new purchase order');
    return;
  }
  else {
    conn.savePurchaseOrder(req.body)
      .then(data => {
        console.log(JSON.stringify(data, null, 4));
        res.status(200).json(data);
      })
      .catch(err => {
        res.status(500).json(err.message);
      });
  }
})

router.put('/purchase-order', auth.verifyToken, (req, res) => {
  console.log("[purchase-order] - START");
  console.log("this is req: %s", JSON.stringify(req.body));
  if (!req.body._id) {
    res.status(400).json('purchase order not found');
    return;
  }
  else {
    conn.savePurchaseOrder(req.body)
      .then(data => {
        console.log(JSON.stringify(data, null, 4));
        res.status(200).json(data);
      })
      .catch(err => {
        res.status(500).json(err.message);
      });
  }
})


router.get('/synch-orders', auth.verifyToken, (req, res) => {
  shopify.getOrdersToSynch()
    .then(orders => {
      shopify.getOrderTransactions(orders)
        .then(transactions => {
          var list = [];
          for (var i = 0, n = orders.length; i < n; i++) {
            //console.log("RESULTS: %O", JSON.stringify(transactions));
            orders[i].transactions = transactions[i];
            // insert or update the document
            list.push(conn.putOrder(orders[i]));
          }
          Promise.all(list)
            .then(() => {
              conn.updateLastOrderUpdateDate()
                .then((response) => {
                  res.status(200).json({ totalOrders: orders.length, result: "Success", max_update_date: response.last_refresh });
                })
                .catch(error => {
                  console.log("(4) ERROR %O", error);
                  res.status(500).json(error);
                });
            })
            .catch(error => {
              console.log("(3) ERROR %O", error);
              res.status(500).json(error);
            });
        })
        .catch(error => {
          console.log("(2) ERROR %O", error);
          res.status(500).send(error)
        });
    })
    .catch(error => {
      console.log("(1) ERROR %O", error);
      res.status(500).send(error)
    });
});

router.get('/synch-order/:id', auth.verifyToken, (req, res) => {
  console.log("API /synch-order by ID [%s]", JSON.stringify(req.params.id));
  if (!req.params.id) {
    res.status(400).json({ message: "No order id found" });
    return;
  }
  var orderWrapper = [];
  orderWrapper[0] = {};
  orderWrapper[0].id = req.params.id;
  Promise.all([shopify.getOrder(req.params.id), shopify.getOrderTransactions(orderWrapper)])
    .then(results => {
      var order = results[0];
      order.transactions = results[1];
      conn.putOrder(order)
        .then(function(data) {
          res.status(200).json(order);
        })
        .catch(function(err) {
          console.log("ERROR: " + JSON.stringify(err));
          res.status(500).json(err);
        });
    })
    .catch(err => {
      res.status(500).send(err)
    });
});

router.get('/synch-product/:id', auth.verifyToken, (req, res) => {
  console.log("API /synch-product");
  console.log("Params: " + JSON.stringify(req.params.id));
  if (!req.params.id) {
    res.status(400).json({ message: "No product id found" });
    return;
  }
  shopify.getProduct(req.params.id)
    .then(product => {
      conn.putProduct(product)
        .then(function(data) {
          //conn.putOrderUpdate(new Date())
          res.status(200).json(product);
        })
        .catch(function(err) {
          res.status(500).json(err);
        });
    })
    .catch(err => {
      res.status(500).send(err)
    });
});

router.get('/analytics/:id', auth.verifyToken, (req, res) => {
  console.log("API /analytics");
  console.log("Params: " + JSON.stringify(req.params.id));
  if (!req.params.id) {
    res.status(400).json({ message: "No selection made" });
    return;
  }
  conn.getAnalytics(req.params.id)
    .then(results => {
      res.status(200).json(results);
    })
    .catch(err => {
      res.status(500).send(err)
    });
});

router.get('/analytics-products/:id', auth.verifyToken, (req, res) => {
  console.log("API /analytics");
  console.log("Params: " + JSON.stringify(req.params.id));
  if (!req.params.id) {
    res.status(400).json({ message: "No selection made" });
    return;
  }
  conn.getAnalyticsByProduct(req.params.id)
    .then(results => {
      res.status(200).json(results);
    })
    .catch(err => {
      res.status(500).send(err)
    });
});

router.get('/lastupdate', auth.verifyToken, (req, res) => {
  conn.getLastUpdate()
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(500).json(err.message);
    });
});

router.post('/products', auth.verifyToken, (req, res) => {
  console.log("this is req: " + JSON.stringify(req.body.products));
  const products = req.body.products;
  const totalProducts = products.length;
  const shopifyProducts = products.map(shopify.convertToShopifyProduct);

  //console.log("CONVERTED PRODUCT LIST: ", JSON.stringify(shopifyProducts, null, 4));

  var list = [];
  for (var i = 0; i < totalProducts; i++) {
    list.push(shopify.postProductThrottler(shopifyProducts[i], i + 1));
  }
  Promise.all(list)
    .then((results) => {
      const statistics = results.reduce(helper.countSuccess, { success_count: 0, failed_count: 0 });
      res.status(200).json({ total_products_submitted: totalProducts, total_products_processed: results.length, success_count: statistics.success_count, failed_count: statistics.failed_count, shopify_products: results });
    })
    .catch(function(err) {
      console.log("HERE - ERROR %O, \n\n%O", err.message, err.response);
      res.status(500).json(err.message);
    });
  // res.status(200).json({total_products_submitted: totalProducts, total_products_processed: 0, shopify_products: shopifyProducts});
})

router.put('/last-product-update', auth.verifyToken, (req, res) => {
  console.log("this is req: " + JSON.stringify(req.body));
  conn.putLastUpdate(constants.PRODUCT_LAST_UPDATE_ID, "PRODUCTS", req.body.last_update)
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(500).json(err.message);
    });
})

router.put('/last-order-update', auth.verifyToken, (req, res) => {
  console.log("this is req: " + JSON.stringify(req.body));
  conn.putLastUpdate(constants.ORDER_LAST_UPDATE_ID, "ORDERS", req.body.last_update)
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(500).json(err.message);
    });
})



router.post('/inventory-update', (req, res) => {
  console.log("this is req: " + JSON.stringify(req.body.products));
  const products = req.body.products;
  const debug = req.body.debug;
  const totalProducts = products.length;

  // 0/ validate that all products have cogs
  // 1/ for each product, get the quantity and product id
  // 2/ if no product id, create a new product in shopify
  // 3/ if product id, update inventory quantity in shopify
  // 4/ refresh the local products from the updated remote products
  // 5/ update cogs on local products

  const errors = inventory.validate(products);
  if (!R.isEmpty(errors)) {
    res.status(500).json({ status: false, errors: errors });
    return
  }

  // if new product, create, otherwise update variant quantity in shopify
  // This will return the updated/created product
  var mapIndexed = R.addIndex(R.map);
  const shopify_promises = mapIndexed((product, index) => R.isNil(product.product_id) ? shopify.addNewProduct(product, index) : shopify.putProductQuantity(product, index))(products);

  Promise.all(shopify_promises)

    .then((shopify_products) => { // here we have the new or updated products in shopify
      // now replace local product data with shopify product data
      // update cogs data
      const local_products_promise = R.map(conn.upsertProduct)(shopify_products)

      Promise.all(local_products_promise)
        .then((local_products_results) => {
          console.log('HERE 11')
          const cogs_promises = mapIndexed(conn.cogsWrapperCurried(shopify_products))(products)
          console.log('HERE 12')
          Promise.all(cogs_promises)
            .then((cogs_results) => {
              console.log('HERE 13')
              if (debug) {
                const pr1 = R.map((p) => conn.getProductById(p.id))(shopify_products)
                Promise.all(pr1)
                  .then((local_products) => {
                    const pr2 = R.map((p) => conn.getCOGSById(p.data.product.id, p.data.product.variants[0].id))(shopify_products)
                    Promise.all(pr2)
                      .then((cogs) => {
                        res.status(200).json({
                          total_products_submitted: totalProducts,
                          total_shopify_products: shopify_products.length,
                          total_local_products: local_products_results.length,
                          total_cogs: cogs_results.length,
                          shopify_products: R.map((d) => d.data.product)(shopify_products),
                          local_products: local_products,
                          cogs: cogs
                        });
                        return;
                      })

                  })
              }
              else {
                res.status(200).json({
                  total_products_submitted: totalProducts,
                  total_shopify_products: shopify_products.length,
                  total_local_products: local_products_results.length,
                  total_cogs: cogs_results.length,
                  shopify_products: shopify_products
                })
                return;
              }
            })
            .catch((err) => {
              console.log("ERROR1: ", JSON.stringify(err, null, 4))
              res.status(500).json(err.message);
            })
        })
        .catch((err) => {
          console.log("ERROR2: ", err)
          res.status(500).json(err.message);
        })
    })
    .catch((err) => {
      console.log("ERROR3: ", JSON.stringify(err, null, 4))
      res.status(500).json(err.message);
    })
})

//     print json.dumps(r)

module.exports = router;
