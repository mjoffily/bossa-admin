var Promise = require('bluebird');
var dbc = require('./db.helper');
var constants = require('./api.constants')
var logger = require('../_logger').logger
const R = require('ramda')
const moment = require('moment');


function updateLastOrderUpdateDate() {
    return new Promise(function(resolve, reject) {
        console.log("[updateLastOrderUpdateDate] - START");
        getMaxOrderUpdatedDate()
            .then(maxdate => {
                console.log("this is the max date for orders in the database [%s]", maxdate)
                console.log("Will add a second so the next call will not pick up the orders up to this point")
                var datePlus1Second = moment(maxdate).add(1, 'second').toDate()
                putLastUpdate(constants.ORDER_LAST_UPDATE_ID, "ORDER", datePlus1Second)
                    .then(result => {
                        getLastUpdate(constants.ORDER_LAST_UPDATE_ID)
                            .then(res => {
                                console.log('test result: ' + res.last_refresh)
                                console.log("[updateLastOrderUpdateDate] - END");
                                resolve(res)
                            })
                            .catch(error => {
                                reject(error)
                            })
                    })
                    .catch(error => {
                        reject(error)
                    })
            })
            .catch(error => {
                reject(error)
            })
    })
}

function getMaxOrderUpdatedDate() {
    return new Promise(function(resolve, reject) {
        console.log("[getMaxOrderUpdatedDate] - START");
        dbc.connect()
            .then(function(db) {
                db.collection(dbc.ORDERS).aggregateAsync([{ $group: { _id: null, maxdate: { $max: "$order.updated_at" } } }])
                    .then(cursor => {
                        cursor.next()
                            .then(result => {
                                console.log('this is the result: %s', JSON.stringify(result, null, 4))
                                const maxdate = (result) ? result.maxdate : constants.BEGIN_OF_TIME;
                                resolve(maxdate);
                                console.log("[getMaxOrderUpdatedDate] - END");
                            })
                            .catch(error => {
                                reject(error)
                            })
                    })
            })
    })
}

function getMaxProductUpdatedDate() {
    return new Promise(function(resolve, reject) {
        dbc.connect()
            .then(function(db) {
                db.collection(dbc.PRODUCTS).aggregateAsync([{ $group: { _id: null, maxdate: { $max: "$order.updated_at" } } }])
                    .then(cursor => {
                        cursor.next()
                            .then(result => {
                                resolve(result);
                            })
                            .catch(error => {
                                reject(error)
                            })
                    })
            })
    })
}

function putLastUpdate(id, type, lastUpdate) {
    return new Promise(function(resolve, reject) {
        console.log("[putLastUpdate] - START");
        console.log("[putLastUpdate] lastUpdate: " + lastUpdate);
        dbc.connect()
            .then(function(db) {
                db.collection(dbc.LAST_UPDATE).updateAsync({ _id: id }, { _id: id, last_refresh: lastUpdate, type: type, updated_at: new Date() }, { upsert: true })
                    .then(function() {
                        console.log("[putLastUpdate] - END (ok)");
                        resolve("ok");
                    })
                    .catch(function(err) {
                        console.log("(1) [putLastUpdate] - END (error)");
                        reject(err);
                    })
            })
            .catch(error => {
                console.log('(2) [putLastUpdate] - END (error)')
                reject(error)
            })
    });
}

function getNextSequenceValue(sequenceName, id) {
    console.log("[getNextSequenceValue] - START");
    return new Promise((resolve, reject) => {
        if (id) {
            console.log("[getNextSequenceValue] - ID %d", id);
            resolve(id);
        }
        else {
            dbc.connect()
                .then(function(db) {
                    db.collection(dbc.COUNTERS).updateAsync({ _id: sequenceName }, { $inc: { sequence_value: 1 } }, { upsert: true })
                        .then(() => {
                            db.collection(dbc.COUNTERS).find({ _id: sequenceName }).toArrayAsync()
                                .then((sequence) => {
                                    const s = String("0000000" + sequence[0].sequence_value).slice(-7); // returns 0000123
                                    console.log("[getNextSequenceValue] - sequence %s", s);
                                    resolve(s);
                                })
                        })
                })
        }
    })
}

function savePurchaseOrder(order) {
    return new Promise(function(resolve, reject) {
        console.log("[savePurchaseOrder] - START");
        console.log("[savePurchaseOrder]: \n\n %o", JSON.stringify(order, null, 4));

        const currDate = new Date();
        order.updated_date = currDate;
        if (!order._id) {
            order.created_date = currDate;
        }

        getNextSequenceValue('purchase-order-id', order._id)
            .then((id) => {
                dbc.connect()
                    .then(function(db) {
                        const query = { _id: id };
                        order._id = id;
                        console.log('This is the query %s', JSON.stringify(query, null, 4));
                        db.collection(dbc.PURCHASE_ORDERS).updateAsync(query, order, { upsert: true })
                            .then(() => {
                                db.collection(dbc.PURCHASE_ORDERS).find({}, {}).toArrayAsync()
                                    .then((items) => {
                                        if (items && items[0]) {
                                            console.log(JSON.stringify(items));

                                            console.log("[savePurchaseOrder] - END (ok)");
                                            resolve(query._id);
                                        }
                                    })
                                    .catch(err => {
                                        console.log("[savePurchaseOrder] - END (error 1)");
                                        reject(err);
                                    })
                            })
                            .catch(function(err) {
                                console.log("[savePurchaseOrder] - END (error) %s", JSON.stringify(err, null, 4));
                                reject(err);
                            })
                    })
                    .catch(function(err) {
                        reject(err);
                    })
            })
            .catch(function(err) {
                reject(err);
            })
    });
}

function getLastUpdate(id) {
    return new Promise(function(resolve, reject) {
        console.log("[getLastUpdate] - START - ID: " + id);
        dbc.connect()
            .then(function(db) {
                if (!id) {
                    db.collection(dbc.LAST_UPDATE).find({}, {}).toArrayAsync()
                        .then(function(items) {
                            if (items) {
                                console.log("[getLastUpdate] - END (ok)");
                                resolve({ last_refresh: items });
                            }
                            else {
                                console.log("[getLastUpdate] - END (error - no items found)");
                                reject({ message: "no data found", code: constants.NO_EXCHANGE_RATE_FOR_THIS_PAIR });
                            }
                        })
                        .catch(function(err) {
                            console.log("[getLastUpdate] - END (error) [%o]", err);
                            reject(err);
                        })
                }
                else {
                    db.collection(dbc.LAST_UPDATE).find({ _id: id }, {}).toArrayAsync()
                        .then(function(items) {
                            if (items && items[0]) {
                                console.log(JSON.stringify(items[0]));
                                var obj = { last_refresh: items[0].last_refresh };
                                console.log("OBJ: " + JSON.stringify(obj));
                                console.log("[getLastUpdate] - END (ok)");
                                resolve(obj);
                            }
                            else {
                                var d = new Date('2017-01-01');
                                console.log("[getLastUpdate] - no data found - will default to %", d);
                                var obj = {last_refresh: d};
                                resolve(obj);
                            }
                        })
                        .catch(function(err) {
                            console.log("[getLastUpdate] - END (error)");
                            reject(err);
                        })
                }
            })
            .catch(function(err) {
                console.log("[getLastUpdate] - END (error)");
                reject(err);
            });
    });
}

function getProductById(id) {
    return new Promise((resolve, reject) => {
        dbc.connect()
            .then(db => {
                db.collection(dbc.PRODUCTS).findOne({ "id": id }, {})
                    .then((result) => {
                        resolve(result)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
    })
}

function getCOGSById(product_id, variant_id) {
    return new Promise((resolve, reject) => {
        dbc.connect()
            .then(db => {
                db.collection(dbc.COGS).findOne({ product_id, variant_id }, {})
                    .then((result) => {
                        resolve(result)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
    })
}

function putCOGS(obj) {
    return new Promise(function(resolve, reject) {
        console.log("[putCOGS] - START");
        console.log("[putCOGS] Product ID: [%s] variant [%s] sku [%s] cogs [%o] ", obj.product_id, obj.variant, obj.sku, obj.cogs);
        dbc.connect()
            .then(function(db) {
                for (var i = 0; i < obj.cogs.length; i++) {
                    obj.cogs[i].dateFrom = new Date(obj.cogs[i].dateFrom);
                    obj.cogs[i].dateTo = new Date(obj.cogs[i].dateTo);
                }

                db.collection(dbc.PRODUCTS).updateAsync({ id: obj.product_id, "product.variants.id": obj.variant, "product.variants.sku": obj.sku }, { $set: { "product.variants.$.cogs": obj.cogs } })
                    .then(data => {
                        console.log("This is the data: %o", data.result);
                        //console.log(" IS n === 1 %s [%s]", (data.result.n === 1), data.result.n);
                        if (data.result.n != 1) {
                            console.log("[putCOGS] - Product/Variant/SKU not found in the database");
                            reject({ err: "Product/Variant/SKU not found in the database", data: obj });
                        }
                        else {
                            console.log("[putCOGS] - END");
                            resolve(data);
                        }
                    })
            });
    });
}

function putOrder(order) {
    return new Promise(function(resolve, reject) {
        console.log("[putOrder] - START - Order [%s]", order.id);
        calcProfit(order)
            .then(updatedOrder => {
                // console.log("This is the updatedOrder: " + JSON.stringify(updatedOrder));
                dbc.connect()
                    .then(db => {
                        // make sure the created_at field is saved as a mongodb date
                        updatedOrder.created_at = new Date(updatedOrder.created_at);
                        console.log('----------------------')
                        console.log('----------------------')
                        console.log('----------------------')
                        console.log(updatedOrder.updated_at)
                        console.log(new Date(updatedOrder.updated_at))
                        console.log(moment(updatedOrder.updated_at).format())
                        console.log('----------------------')
                        console.log('----------------------')
                        console.log('----------------------')
                        updatedOrder.updated_at = new Date(updatedOrder.updated_at);
                        updatedOrder.closed_at = new Date(updatedOrder.closed_at);
                        updatedOrder.total_price = parseFloat(updatedOrder.total_price);
                        updatedOrder.subtotal_price = parseFloat(updatedOrder.subtotal_price);
                        updatedOrder.total_tax = parseFloat(updatedOrder.total_tax);
                        updatedOrder.total_discounts = parseFloat(updatedOrder.total_discounts);
                        updatedOrder.total_line_items_price = parseFloat(updatedOrder.total_line_items_price);
                        updatedOrder.total_price_usd = parseFloat(updatedOrder.total_price_usd);

                        db.collection(dbc.ORDERS).updateAsync({ id: updatedOrder.id }, { $set: { order: updatedOrder } }, { upsert: true })
                            .then(data => {
                                //console.log("This is the data: " + JSON.stringify(data));
                                resolve(data);
                            })
                            .catch(err => {
                                console.log("[putOrder] - END (error1) - Order [%s]", order.id);
                                reject(err);
                            })
                    })
                    .catch(function(err) {
                        console.log("[putOrder] - END (error2) - Order [%s]", order.id);
                        reject(err);
                    });
            })
            .catch(function(err) {
                console.log("[putOrder] - END (error3) - Order [%s] - Error %O", order.id, err);
                reject(err);
            });
    });
}


function getCOGSForVariant(orderId, productId, variantId, orderDate, lineItem) {
    return new Promise(function(resolve, reject) {
        console.log("[getCOGSForVariant] - START - Order [%s] - Product [%s] - Variant [%s]", orderId, productId, variantId);
        dbc.connect()
            .then(function(db) {
                db.collection(dbc.PRODUCTS).aggregateAsync([
                        { $unwind: "$product.variants" }, { $project: { _id: 0, product_id: "$product.id", image: "$product.image.src", variant: "$product.variants" } }, { $match: { product_id: productId, "variant.id": { $eq: variantId } } }, { $unwind: "$variant.cogs" }, { $match: { $and: [{ "variant.cogs.dateFrom": { $lte: new Date(orderDate) } }, { "variant.cogs.dateTo": { $gte: new Date(orderDate) } }] } }
                    ])

                    //db.collection(PRODUCTS).aggregateAsync([{$project: {id: 1}}, { $match: { id: productId}}])
                    .then(cursor => {
                        cursor.next()

                            .then(productWrapper => {

                                //console.log("[getCOGSForVariant] - "  + variantId + " This is the product: " + JSON.stringify(productWrapper, null, 4));
                                var cogs = {};
                                if (productWrapper) {
                                    cogs.image = productWrapper.image;
                                    cogs.cogs = productWrapper.variant.cogs;
                                    lineItem.cogs = cogs;
                                    console.log("[getCOGSForVariant] - " + variantId + " RESOLVING 1");
                                    resolve(lineItem);
                                }
                                else {
                                    // set empty cogs
                                    lineItem.cogs = cogs;
                                    console.log("[getCOGSForVariant] - " + variantId + " RESOLVING 2");
                                    resolve(lineItem);
                                }
                            })
                            .catch(function(err) {
                                console.log("[getCOGSForVariant] - " + variantId + " END (error 1) " + err);
                                reject(err);
                            });
                    })
                    .catch(function(err) {
                        console.log("[getCOGSForVariant] - END (error 2) " + err);
                        reject(err);
                    });
            })
            .catch(function(err) {
                console.log("[getCOGSForVariant] - END (error 3) " + err);
                reject(err);
            });
    });
}

function getPurchaseOrders() {
    return new Promise(function(resolve, reject) {
        console.log("[getPurchaseOrders] - START");
        dbc.connect()
            .then(function(db) {
                //db.collection(PRODUCTS).find({id: productId}, {"product.variants":1, "product.image.src":1}).toArrayAsync()
                db.collection(dbc.PURCHASE_ORDERS).aggregateAsync([
                        { $project: { _id: 1, total_order_cost: 1, created_date: 1, updated_date: 1, number_of_items: { $size: "$items" } } }
                    ])
                    .then(cursor => {
                        cursor.toArray()
                            .then((poList) => {
                                console.log(JSON.stringify(poList, null, 4))
                                console.log("[getPurchaseOrders] - END");
                                resolve(poList);
                            })
                            .catch(function(err) {
                                console.log("[getPurchaseOrders] - ERROR ");
                                reject(err);
                            });
                    })
                    .catch(function(err) {
                        console.log("[getPurchaseOrders] - ERROR 2");
                        reject(err);
                    });
            })
            .catch(function(err) {
                console.log("[getPurchaseOrders] - ERROR 3 %s", JSON.stringify(err, null, 4));
                reject(err);
            });
    });
}

function getPurchaseOrder(id) {
    return new Promise(function(resolve, reject) {
        console.log("[getPurchaseOrder] - START - ID %s", id);
        dbc.connect()
            .then(function(db) {
                //db.collection(PRODUCTS).find({id: productId}, {"product.variants":1, "product.image.src":1}).toArrayAsync()
                db.collection(dbc.PURCHASE_ORDERS).find({ _id: id }).toArrayAsync()
                    .then((po) => {
                        console.log("[getPurchaseOrder] - END");
                        resolve(po[0]);
                    })
                    .catch(function(err) {
                        console.log("[getPurchaseOrder] - ERROR ");
                        reject(err);
                    });
            })
            .catch(function(err) {
                console.log("[getPurchaseOrder] - ERROR 2");
                reject(err);
            });
    });
}

function calcTransactionFee(orderId, transactions) {
    return new Promise(function(resolve, reject) {
        if (!transactions) {
            var err = "No transactions found for order id " + orderId;
            reject({ error: err });
        }
        else {
            // initialise with the first payment transaction. This may or may not be successful, but there are 
            // none successful, we will process with the first one. It will with a null fee_amount, but the
            // system will not crash. TODO proper handling for the case where there are zero entries succesful
            var tran = transactions[0];

            // find the one that was processed successfuly
            for (var i = 0; i < transactions.length; i++) {
                if (transactions[i].status === "success") {
                    tran = transactions[i];
                    break;
                }
            }
            console.log("ORDERID [%s] TRAN: [%o]", orderId, JSON.stringify(tran));
            var transaction_fee_summary = {};
            transaction_fee_summary.fee_amount = 0.00;
            transaction_fee_summary.gateway = tran.gateway;
            transaction_fee_summary.status = tran.status;
            transaction_fee_summary.kind = tran.kind;
            if (tran.gateway === "manual") {
                transaction_fee_summary.processing_status = "ok";
            }
            else if (tran.gateway === "paypal") {
                console.log("PAYPAL [%s] - [%s]", orderId, tran.gateway);
                transaction_fee_summary.processing_status = "ok";
                if (tran.receipt.fee_amount) {
                    transaction_fee_summary.fee_amount = Number(tran.receipt.fee_amount);
                }
                else if (tran.receipt.mc_fee) {
                    transaction_fee_summary.fee_amount = Number(tran.receipt.mc_fee);
                }
                else {
                    transaction_fee_summary.processing_status = "ERROR - could not find transaction fee in paypal transaction";
                }
            }
            else if (tran.gateway === "shopify_payments") {
                transaction_fee_summary.fee_amount = tran.receipt.balance_transaction.fee / 100;
                transaction_fee_summary.processing_status = "ok";
            }
            else {
                transaction_fee_summary.processing_status = "ERROR - gateway not supported";
                console.log("NO gateway %s, %O", orderId, JSON.stringify(tran));
            }
            resolve(transaction_fee_summary);
        }

    })
}

function calcProfit(order) {
    return new Promise(function(resolve, reject) {
        console.log("[calcProfit] - START - Order [%s]", order.id);
        var list = [];
        for (var i = 0; i < order.line_items.length; i++) {
            var orderDate = order.created_at;
            var lineItem = order.line_items[i];
            var variantId = lineItem.variant_id;
            var productId = lineItem.product_id;
            //lookup product to get COGS.
            // get also photo link, variant sku
            list.push(getCOGSForVariant(order.id, productId, variantId, orderDate, lineItem));
            // save COGS
        }
        Promise.all(list)
            .then(updatedLineItems => {
                console.log("[calcProfit] [%s] - 1 ", order.id);
                order.profit_summary = {};
                order.profit_summary.total_order_cost = 0.0;
                order.profit_summary.highest_handling_cost = 0.0;
                order.profit_summary.calc_profit_status = "ok";
                //console.log("[calcProfit] - 2");
                for (var i = 0; i < updatedLineItems.length; i++) {
                    console.log("[calcProfit] - [%s] - 2.1 i = %d", order.id, i);
                    if (updatedLineItems[i].cogs.cogs) {
                        console.log("[calcProfit] - [%s] - 3 ", order.id);
                        order.profit_summary.total_order_cost += updatedLineItems[i].cogs.cogs.cost;
                        if (updatedLineItems[i].cogs.cogs.handlingCost > order.profit_summary.highest_handling_cost) {
                            console.log("[calcProfit] - [%s] - 4", order.id);
                            order.profit_summary.highest_handling_cost += updatedLineItems[i].cogs.cogs.handlingCost;
                        }
                    }
                    else {
                        console.log("[calcProfit] - [%s] - 3.1", order.id);
                        order.profit_summary.calc_profit_status = "dodgy - line item missing COGS";
                    }
                }

                console.log("[calcProfit] - 5");
                order.line_items = updatedLineItems;
                console.log("[calcProfit] - 5.1");
                console.log("[calcProfit] - 5.2");
                order.profit_summary.revenue = Number(order.total_price);
                console.log("[calcProfit] - 5.3");
                //order.profit_summary.profit = order.total_line_items_price - order.total_discounts - order.total_order_cost - order.highest_handling_cost - order.total_tax - order.transaction_fee_summary.fee_amount;
                calcTransactionFee(order.id, order.transactions)
                    .then(feeSummary => {
                        order.profit_summary.profit = order.total_line_items_price - order.total_discounts - order.profit_summary.total_order_cost - order.profit_summary.highest_handling_cost - order.total_tax - feeSummary.fee_amount;
                        console.log("[calcProfit] - 5.4");
                        order.profit_summary.profit_margin = parseFloat((order.profit_summary.profit / order.profit_summary.revenue) * 100);
                        console.log("[calcProfit] - 5.5");
                        order.profit_summary.transaction_fee_summary = feeSummary;
                        console.log("[calcProfit] - [%s] - 6", order.id);
                        if (order.profit_summary.calc_profit_status === "ok" && (!order.profit_summary.profit && order.profit_summary.profit !== 0)) { // ok so far, but the calculated profit is null => something is wrong
                            order.profit_summary.calc_profit_status = "dodgy - Profit is null";
                        }
                        console.log("[calcProfit] - END [%s]", order.id);
                        resolve(order);
                    })
                    .catch(err => {
                        console.log("[calcProfit] - END ERROR [%s]", order.id);
                        console.log("[calcProfit] - [%s], err: %o", order.id, JSON.stringify(err, null, 4));
                        reject(err);
                    });
            })
            .catch(err => {
                console.log("[calcProfit] - END ERROR");
                console.log("[calcProfit] - err: " + JSON.stringify(err, null, 4));
                reject(err);
            });
    });
}

function getProductsLocal() {
    return new Promise(function(resolve, reject) {
        console.log("[getProductsLocal] - START");
        dbc.connect()
            .then(function(db) {
                db.collection(dbc.PRODUCTS).find({}, {}).toArrayAsync()
                    .then(function(products) {
                        if (products) {
                            console.log("[getProductsLocal] - END (ok)");
                            resolve(products);
                        }
                        else {
                            console.log("[getProductsLocal] - END (error - no products found)");
                            reject({ message: "no data found", code: constants.NO_EXCHANGE_RATE_FOR_THIS_PAIR });
                        }
                    })
                    .catch(function(err) {
                        console.log("[getProductsLocal] - END (error)");
                        reject(err);
                    })
            })
            .catch(function(err) {
                console.log("[getProductsLocal] - END (error)");
                reject(err);
            });
    });
}

function getProductsLocalMin() {
    return new Promise(function(resolve, reject) {
        logger.debug("[getProductsLocalMin] - START");
        dbc.connect()
            .then(function(db) {
                var mydate = new Date()
                var queryResults = []
                queryResults.push(db.collection(dbc.PRODUCTS).aggregateAsync([
                    { $unwind: "$product.variants" }, { $project: { _id: 0, product_id: "$product.id", variant: "$product.variants", photo: "$product.image.src" } }, { $unwind: "$variant.cogs" }, { $match: { $and: [{ "variant.cogs.dateFrom": { $lte: mydate } }, { "variant.cogs.dateTo": { $gte: mydate } }] } }, { $project: { product_id: 1, my_sku: "$variant.sku", price: "$variant.cogs.costSourceCurrency", photo: "$photo" } }
                ]))
                queryResults.push(db.collection(dbc.PRODUCTS).aggregateAsync([
                    { $unwind: "$product.variants" }, { $project: { _id: 0, product_id: "$product.id", variant: "$product.variants", photo: "$product.image.src" } }, { $match: { "variant.cogs": null } }, { $project: { product_id: 1, my_sku: "$variant.sku", price: { $literal: 0 }, photo: "$photo" } }
                ]))
                Promise.all(queryResults)
                    .then((cursor) => { // unpack the products from the cursor
                        var productsPromises = R.map((c) => {
                            return c.toArray()
                                .then((products) => {
                                    logger.debug({ products_length: products.length })
                                    logger.debug({ Returning_these_products: products })
                                    return products
                                })
                                .catch((error) => {
                                    logger.error("[getProductsLocalMin] - END (error 1)");
                                    reject(error)
                                })
                        }, cursor)
                        Promise.all(productsPromises)
                            .then((results) => {
                                // bring result from both queries together
                                const r = R.concat(results[0], results[1]);
                                resolve(r)
                            })
                            .catch((err) => {
                                logger.error({ msg: "[getProductsLocalMin] - ENdD (error 2)" });
                                reject(err);
                            })
                    })
                    .catch(function(err) {
                        logger.error("[getProductsLocal] - END (error 3)");
                        reject(err);
                    });
            })
            .catch(function(err) {
                logger.error("[getProductsLocal] - END (error 4)");
                reject(err);
            });

    })

}

function getOrdersLocal() {
    return new Promise(function(resolve, reject) {
        console.log("[getOrdersLocal] - START");
        dbc.connect()
            .then(function(db) {
                db.collection(dbc.ORDERS).find({}, {}).toArrayAsync()
                    .then(function(orders) {
                        if (orders) {
                            console.log("[getOrdersLocal] - END (ok)");
                            resolve(orders);
                        }
                        else {
                            console.log("[getOrdersLocal] - END (error - no orders found)");
                            reject({ message: "no data found", code: constants.NO_EXCHANGE_RATE_FOR_THIS_PAIR });
                        }
                    })
                    .catch(function(err) {
                        console.log("[getOrdersLocal] - END (error)");
                        reject(err);
                    })
            })
            .catch(function(err) {
                console.log("[getOrdersLocal] - END (error)");
                reject(err);
            });
    });
}

function getAnalytics(type) {
    return new Promise(function(resolve, reject) {
        console.log("[getAnalytics] - START - Type [%s]", type);
        dbc.connect()
            .then(function(db) {
                db.collection(dbc.ORDERS).aggregateAsync([
                        { $group: { _id: { year: { $year: "$order.created_at" }, month: { $month: "$order.created_at" } }, total_revenue: { $sum: "$order.profit_summary.revenue" }, total_profit: { $sum: "$order.profit_summary.profit" } } }, { $sort: { "_id.year": 1, "_id.month": 1 } }, { $project: { year: { $substr: ["$_id.year", 0, -1] }, month: { $substr: ["$_id.month", 0, -1] }, total_revenue: 1, total_profit: 1 } }, { $project: { when: { $concat: ["$year", "/", "$month"] }, total_revenue: 1, total_profit: 1, percentage: { $divide: ["$total_profit", "$total_revenue"] } } }
                    ])
                    .then(cursor => {
                        cursor.toArray()
                            .then(results => {
                                console.log("[getAnalytics] - This is the result: " + JSON.stringify(results, null, 4));
                                resolve(results);
                            })
                            .catch(function(err) {
                                console.log("[getAnalytics] - END (error 1) " + err);
                                reject(err);
                            });
                    })
                    .catch(function(err) {
                        console.log("[getAnalytics] - END (error 2) " + err);
                        reject(err);
                    });
            })
            .catch(function(err) {
                console.log("[getAnalytics] - END (error 3) " + err);
                reject(err);
            });
    });
}

function getAnalyticsByProduct(type) {
    return new Promise(function(resolve, reject) {
        console.log("[getAnalyticsByProduct] - START - Type [%s]", type);
        dbc.connect()
            .then(function(db) {
                db.collection(dbc.ORDERS).aggregateAsync([

                        { $unwind: "$order.line_items" }, { $group: { _id: { year: { $year: "$order.created_at" }, month: { $month: "$order.created_at" }, sku: "$order.line_items.sku", variant_id: "$order.line_items.variant_id" }, count: { $sum: "$order.line_items.quantity" } } }, { $sort: { "_id.year": 1, "_id.month": 1, "count": -1 } }, { $project: { year: { $substr: ["$_id.year", 0, -1] }, month: { $substr: ["$_id.month", 0, -1] }, sku: 1, variant_id: 1, count: 1 } }, { $project: { when: { $concat: ["$year", "/", "$month"] }, sku: 1, variant_id: 1, count: 1 } }
                    ])
                    .then(cursor => {
                        cursor.toArray()
                            .then(results => {
                                console.log("[getAnalyticsByProduct] - This is the result: " + JSON.stringify(results, null, 4));
                                resolve(results);
                            })
                            .catch(function(err) {
                                console.log("[getAnalyticsByProduct] - END (error 1) " + err);
                                reject(err);
                            });
                    })
                    .catch(function(err) {
                        console.log("[getAnalyticsByProduct] - END (error 2) " + err);
                        reject(err);
                    });
            })
            .catch(function(err) {
                console.log("[getAnalytics] - END (error 3) " + err);
                reject(err);
            });
    });
}


// given 2 values. If the new value is less than zero, return the initial value, otherwise return the new value
function negativeToValue(initialVal, newVal) {
    return newVal < 0 ? initialVal : newVal
}

const negativeToValueCurried = R.curry(negativeToValue);

function insertCOGSRecord(cogsList, cogsToInsert) {
    const idx = R.pipe(
        R.findIndex((cogs) => (cogs.date_from >= cogsToInsert.date_from)),
        negativeToValueCurried(cogsList.length)
    )(cogsList)
    const mergedList = R.insert(idx, cogsToInsert, cogsList)
    return R.mapAccumRight(setDateAsPrevious, -1, mergedList)[0]

}

function setDateAsPrevious(obj, accum) {
    const date_to = (accum != -1) ? accum : obj.date_to
    // return a tupple with the accummulator (containing the date_from to be used in the next iteration) and the modified COGS object
    const newAccum = moment(obj.date_from).subtract(1, 'days').toDate() // save the date_from of the element in the accummulator to be used with the next element
    const newObj = { ...obj, date_to }
    return [newAccum, newObj]
}

function prepareCOGSFromPurchaseOrder(po) {
    const { cost_in_real, cost_in_aud, exchange_rate, po_id } = po
    const date_from = moment().toDate()
    const date_to = moment(constants.END_OF_TIMES).toDate()
    const handling_cost = constants.HANDLING_COST
    return { date_from, date_to, cost_in_real, cost_in_aud, handling_cost, exchange_rate, po_id }

}

function updateCOGSToVariant(currentCOGS, cogsToAdd) {

    const newCOGS = insertCOGSRecord(currentCOGS.cogs, cogsToAdd)
    return { ...currentCOGS, cogs: newCOGS }

}

function addCOGSToVariant(product_id, variant_id, cogsEntry) {
    return { product_id, variant_id, cogs: [cogsEntry] }
}

function handleCOGS(product_id, variant_id, po) {
    return new Promise((resolve, reject) => {
        const cogsToAdd = prepareCOGSFromPurchaseOrder(po)
        getCOGSById(product_id, variant_id)
            .then((exitingCOGS) => {
                const updatedCOGS = R.isNil(exitingCOGS) ? addCOGSToVariant(product_id, variant_id, cogsToAdd) : updateCOGSToVariant(exitingCOGS, cogsToAdd)
                upsertCOGS(updatedCOGS)
                    .then((res) => {
                        resolve()
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
            .catch((err) => { reject(err) })
    })
}

function cogsWrapper(shopify_products, product, index) {
    console.log('THis is the shopify product: ', JSON.stringify(shopify_products, null, 4))
    const product_id = R.isNil(product.product_id) ? shopify_products[index].data.product.id : product.product_id
    const variant_id = R.isNil(product.variant_id) ? shopify_products[index].data.product.variants[0].id : product.variant_id
    return handleCOGS(product_id, variant_id, product)
}

const cogsWrapperCurried = R.curry(cogsWrapper);

function upsertProduct(product) {
    return new Promise((resolve, reject) => {
        console.log("[upsertProduct] - START");

        dbc.connect()
            .then((db) => {
                db.collection(dbc.PRODUCTS).replaceOne({ id: product.id }, product, { upsert: true })
                    .then(() => {
                        console.log("[upsertProduct] - END (ok)");
                        resolve("ok");
                    })
                    .catch((err) => {
                        console.log("[upsertProduct] - END (error)");
                        reject(err);
                    })
            })
            .catch(function(err) {
                reject(err);
            })
    });
}

function upsertCOGS(cogs) {
    return new Promise((resolve, reject) => {
        console.log("[upsertCOGS] - START");
        dbc.connect()
            .then((db) => {
                db.collection(dbc.COGS).replaceOne({ product_id: cogs.product_id, variant_id: cogs.variant_id }, cogs, { upsert: true })
                    .then(() => {
                        console.log("[upsertCOGS] - END (ok)");
                        resolve("ok");
                    })
                    .catch((err) => {
                        console.log("[upsertCOGS] - END (error)");
                        reject(err);
                    })
            })
            .catch(function(err) {
                reject(err);
            })
    });
}

function countOrders() {
    return new Promise((resolve, reject) => {
        dbc.connect()
        .then(db => {
            db.collection(dbc.ORDERS).countAsync({})
            .then(result => {
                console.log(JSON.stringify(result))
                resolve(result)
            })
            .catch(error => {
                console.log("ERROR: %s", JSON.stringify(error, null, 4))
                reject(error)
            })
        })
    })
}


module.exports = {
    getMaxOrderUpdatedDate,
    getLastUpdate,
    putLastUpdate,
    getAnalytics,
    getAnalyticsByProduct,
    putOrder,
    getOrdersLocal,
    getCOGSForVariant,
    putCOGS,
    getProductsLocal,
    getProductsLocalMin,
    savePurchaseOrder,
    getPurchaseOrders,
    getPurchaseOrder,
    getProductById,
    getCOGSById,
    insertCOGSRecord,
    setDateAsPrevious,
    prepareCOGSFromPurchaseOrder,
    upsertProduct,
    upsertCOGS,
    addCOGSToVariant,
    handleCOGS,
    cogsWrapperCurried,
    updateLastOrderUpdateDate,
    countOrders
};
