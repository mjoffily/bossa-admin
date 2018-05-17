'use strict';

var express = require('express');
var router = express.Router();
var conn = require('./api.connect');
var shopify = require('./api.shopify');
var helper = require('./api.helper');
var constants = require('./api.constants');


router.get('/', (req, res) => {
  res.send('api is up and running!');
});

router.post('/login', (req, res) => {
  console.log("[login] - START");
  console.log("this is req: %s", JSON.stringify(req.body));
  const { userid, password } = req.body;
  if (! userid) {
    res.status(400).json('User is required');
    return;
  }
  
  if (! password) {
    res.status(400).json('Password is required');
    return;
  }
  conn.pwd(userid, password)
  .then(match => {
    console.log('Password matches {%s}', match);
    match ? res.status(200).json({status: true, error_msg: ''}) : res.status(200).json({status: false, error_msg: 'invalid userid or password'});
  })
  .catch(err => {
    res.status(500).json(err.message);
  });  
})


router.get('/products-local', (req, res) => {
  conn.getProductsLocal()
  .then(data => {
      res.status(200).json(data);
  })
  .catch(error => {
    res.status(500).send(error)
  });
});

router.get('/products-minimum', (req, res) => {
  conn.getProductsLocalMin()
  .then(data => {
      res.status(200).json(data);
  })
  .catch(error => {
    res.status(500).send(error)
  });
});

router.get('/orders-local', (req, res) => {
  conn.getOrdersLocal()
  .then(data => {
      res.status(200).json(data);
  })
  .catch(error => {
    res.status(500).send(error)
  });
});

router.get('/products-to-be-synched', (req, res) => {
  console.log("[route products-to-be-synched] - START");
  shopify.getProductsToSynch()
  .then(data => {
    var result = {totalProducts: data.length, products: data};
    res.status(200).json(result);
  })
  .catch(error => {
    console.log("[route products-to-be-synched] - ERROR");
    res.status(500).send("a server error has occurred processing your request.");
  });
});

router.get('/orders-to-be-synched', (req, res) => {
  console.log("[route orders-to-be-synched] - START");
  shopify.getOrdersToSynch()
  .then(data => {
    var result = {totalOrders: data.length, orders: data};
    res.status(200).json(result);
  })
  .catch(error => {
    console.log("[route orders-to-be-synched] - ERROR");
    res.status(500).send("a server error has occurred processing your request.");
  });
});

router.get('/synch-products', (req, res) => {
  shopify.getProductsToSynch().then(products => {
    var list = [];
    for (var i=0, n=products.length; i < n; i++ ) {
      // insert or update the document
      list.push(conn.putProduct(products[i]));
    }
    Promise.all(list)
    .then(function() {
      //conn.putProductLastUpdate(new Date())
      res.status(200).json({totalProducts: products.length, result: "Success"});
    })
    .catch(function(err) {
      res.status(500).json(err);
    });
  })
  .catch(error => {
    res.status(500).send(error)
  });
});

router.put('/cogs', (req, res) => {
  console.log("[route cogs] - START");
  console.log("this is req: %s", JSON.stringify(req.body));
  //var data = JSON.parse(req.body);
  console.log(JSON.stringify(req.body));
  var list = [];
  for (var i=0, n=req.body.length; i < n; i++) {
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

router.get('/purchase-orders', (req, res) => {
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

router.get('/purchase-order/:id', (req, res) => {
  console.log("[GET purchase-order] - START");

  if (!req.params.id) {
    res.status(400).json({message: "No purchase order id found"});
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


router.post('/purchase-order', (req, res) => {
  console.log("[purchase-order] - START");
  console.log("this is req: %s", JSON.stringify(req.body));
  if (req.body._id) {
    res.status(400).json('_id field must not exist to post a new purchase order');
    return;
  } else {
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

router.put('/purchase-order', (req, res) => {
  console.log("[purchase-order] - START");
  console.log("this is req: %s", JSON.stringify(req.body));
  if (!req.body._id) {
    res.status(400).json('purchase order not found');
    return;
  } else {
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


router.get('/synch-orders', (req, res) => {
  shopify.getOrdersToSynch()
  .then(orders => {
      shopify.getOrderTransactions(orders)
      .then(transactions => {
      console.log("HERE - 2 " + transactions);
      var list = [];
      for (var i=0, n=orders.length; i < n; i++ ) {
        //console.log("RESULTS: %O", JSON.stringify(transactions));
        orders[i].transactions = transactions[i];
        // insert or update the document
        list.push(conn.putOrder(orders[i]));
      }
      Promise.all(list)
      .then(() => {
        console.log("HERE - 2222");
        //conn.putOrderUpdate(new Date())
        res.status(200).json({totalOrders: orders.length, result: "Success"});
      })
      .catch(function(err) {
        console.log("HERE - ERROR %O", err);
        res.status(500).json(err);
      });
    })
    .catch(err => {
      res.status(500).send(err)
    });
  })
  .catch(err => {
    res.status(500).send(err)
  });
});

router.get('/synch-order/:id', (req, res) => {
  console.log("API /synch-order");
  console.log("Params: " + JSON.stringify(req.params.id));
  if (!req.params.id) {
    res.status(400).json({message: "No order id found"});
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
        //conn.putOrderUpdate(new Date())
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

router.get('/synch-product/:id', (req, res) => {
  console.log("API /synch-product");
  console.log("Params: " + JSON.stringify(req.params.id));
  if (!req.params.id) {
    res.status(400).json({message: "No product id found"});
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

router.get('/analytics/:id', (req, res) => {
  console.log("API /analytics");
  console.log("Params: " + JSON.stringify(req.params.id));
  if (!req.params.id) {
    res.status(400).json({message: "No selection made"});
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

router.get('/analytics-products/:id', (req, res) => {
  console.log("API /analytics");
  console.log("Params: " + JSON.stringify(req.params.id));
  if (!req.params.id) {
    res.status(400).json({message: "No selection made"});
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

router.get('/lastupdate', (req, res) => {
  conn.getLastUpdate()
  .then(data => {
    res.status(200).json(data);
  })
  .catch(err => {
    res.status(500).json(err.message);
  });  
});

router.post('/products', (req, res) => {
  console.log("this is req: " + JSON.stringify(req.body.products));
  const products = req.body.products;
  const totalProducts = products.length;
  const shopifyProducts = products.map(shopify.convertToShopifyProduct);
  
  //console.log("CONVERTED PRODUCT LIST: ", JSON.stringify(shopifyProducts, null, 4));
    
  var list = [];
  for (var i=0; i < totalProducts; i++ ) {
    list.push(shopify.postProductThrottler(shopifyProducts[i], i+1));
  }
  Promise.all(list)
  .then((results) => {
    console.log("HERE - 2222");
    const statistics = results.reduce(helper.countSuccess, {success_count: 0, failed_count: 0});
    res.status(200).json({total_products_submitted: totalProducts, total_products_processed: results.length, success_count: statistics.success_count, failed_count: statistics.failed_count, shopify_products: results});
  })
  .catch(function(err) {
    console.log("HERE - ERROR %O, \n\n%O", err.message, err.response);
    res.status(500).json(err.message);
  });
   // res.status(200).json({total_products_submitted: totalProducts, total_products_processed: 0, shopify_products: shopifyProducts});
})

router.put('/last-product-update', (req, res) => {
  console.log("this is req: " + JSON.stringify(req.body));
  conn.putLastUpdate(constants.PRODUCT_LAST_UPDATE_ID ,"PRODUCTS", req.body.last_update)
  .then(data => {
    res.status(200).json(data);
  })
  .catch(err => {
    res.status(500).json(err.message);
  });  
})

router.put('/last-order-update', (req, res) => {
  console.log("this is req: " + JSON.stringify(req.body));
  conn.putLastUpdate(constants.ORDER_LAST_UPDATE_ID ,"ORDERS", req.body.last_update)
  .then(data => {
    res.status(200).json(data);
  })
  .catch(err => {
    res.status(500).json(err.message);
  });  
})

//     print json.dumps(r)

module.exports = router;