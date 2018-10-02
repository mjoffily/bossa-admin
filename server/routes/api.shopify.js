'use strict';

var axios = require('axios');
var conn = require('./api.connect');
var constants = require('./api.constants');
const SEC = require('../secure/credentials')
var config = require('../_config')
const R = require('ramda')


const env = R.defaultTo('test', process.env.NODE_ENV);
const BASE_URL = config.shopifyBaseUrl[env];
const API_PRODUCT_COUNT = BASE_URL + '/products/count.json';
const API_PRODUCTS = BASE_URL + '/products.json?limit=250&fields=id,product_type,tags,title,price,created_at,updated_at,image,variants';
const API_PRODUCT_BASE = BASE_URL + '/products/$id.json'
const API_PRODUCT = API_PRODUCT_BASE + '?fields=id,product_type,tags,title,price,created_at,updated_at,image,variants';
const API_ORDERS = BASE_URL + '/orders.json?status=any&limit=250';
const API_ORDERS_POST = BASE_URL + '/orders.json';
const API_ORDER = BASE_URL + '/orders';
const API_ORDERS_COUNT = BASE_URL + '/orders/count.json?';
const API_DELETE_ORDER = BASE_URL + '/orders/$id.json';
const API_TRANSACTIONS_FOR_ORDER = BASE_URL + '/orders/$id/transactions.json';
const API_POST_PRODUCT = BASE_URL + '/products.json';

const auth = {
    username: config.secrets[env].api_key,
    password: config.secrets[env].api_pass
}
const CONFIG = {
    auth
}
//console.log = function() {}

function getProductsToSynch() {
    return new Promise(function(resolve, reject) {
        console.log("[getProductsToSynch] - START");
        conn.getLastUpdate(constants.PRODUCT_LAST_UPDATE_ID).then(data => {
            var api = API_PRODUCTS + "&updated_at_min=" + data.last_refresh
            console.log("API: " + api);
            axios.get(api, CONFIG)
                .then(posts => {
                    resolve(posts.data.products);

                })
                .catch(error => {
                    console.log("[getProductsToSynch] - ERROR");
                    console.log("[getProductsToSynch] - " + error);
                    console.log("_1: " + JSON.stringify(error.response.data));
                    console.log("_2: " + JSON.stringify(error.response.status));
                    console.log("_3: " + JSON.stringify(error.response.headers));
                    console.log("_4: " + error.message);
                    reject(error);
                });
        });
    });
}

function getOrdersToSynch() {
    return new Promise(function(resolve, reject) {
        conn.getLastUpdate(constants.ORDER_LAST_UPDATE_ID).then(data => {
            var api = API_ORDERS + "&updated_at_min=" + data.last_refresh
            console.log("API: " + api);
            axios.get(api, CONFIG)
                .then(result => {
                    resolve(result.data.orders);

                })
                .catch(error => {
                    reject(error);
                });
        });
    });
}

function getOrder(id) {
    return new Promise(function(resolve, reject) {
        console.log("[getOrder] - START - ID: " + id);
        var api = API_ORDER + "/" + id + ".json";
        console.log("API: " + api);
        axios.get(api, CONFIG)
            .then(result => {
                resolve(result.data.order);
            })
            .catch(error => {
                reject(error);
            });
    });
}

function sleeper(ms, i) {
    console.log("entry sleeper %d", i)
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("SLEEPER: %d", i, new Date());
            resolve()
        }, ms);
    });
}

function apiThrottler(url, i) {
    return new Promise((resolve, reject) => {
        sleeper(500 * i, i) //note 500*i - this is important. Cannot have a constant, say 500 ms here or it will not work.
            //Best explanation I found for this is here https://stackoverflow.com/questions/30514584/delay-each-loop-iteration-in-node-js-async
            // See comments within chosen answer
            .then((x) => {
                axios.get(url, CONFIG)
                    .then((result => {
                        resolve(result);
                    }));
            })
    })
}

function getOrderTransactions(orders) {
    return new Promise(function(resolve, reject) {
        console.log("[getOrderTransactions] - START");
        var promises = [];
        for (var i = 0, n = orders.length; i < n; i++) {
            var api = API_TRANSACTIONS_FOR_ORDER.replace("$id", orders[i].id);
            console.log("[getOrderTransactions] - START (%d) - ORDER ID: %s", i + 1, orders[i].id);
            console.log("API: " + api);
            console.log("PUSHING: ", new Date());
            promises.push(apiThrottler(api, i + 1));
        }
        Promise.all(promises)
            .then(results => {
                var transactions = [];
                //console.log("[getOrderTransactions] - END - ORDER ID: %d, %s", results.length, str);
                for (var j = 0; j < results.length; j++) {
                    transactions[j] = results[j].data.transactions;
                }
                console.log("[getOrderTransactions] - END - ORDER ID: %d", transactions.length);
                //console.log("TRANSACTIONS: " + JSON.stringify(result.data, null, 4));
                resolve(transactions);
            })
            .catch(error => {
                console.log("[getOrderTransactions] - ERROR %O", error);
                reject(error);
            });
    });
}

function getProduct(id) {
    return new Promise(function(resolve, reject) {
        console.log("[getProduct] - START - ID: " + id);
        var api = API_PRODUCT.replace("$id", id);
        console.log("API: " + api);
        axios.get(api, CONFIG)
            .then(result => {
                resolve(result.data.product);
            })
            .catch(error => {
                reject(error);
            });
    });
}

function countProducts(handle) {
    return new Promise(function(resolve, reject) {
        console.log("[countProducts] - START - Handle: [%s]", handle);
        var api = API_PRODUCT_COUNT + '?handle=' + handle;
        console.log("API: " + api);
        axios.get(api, CONFIG)
            .then(result => {
                const count = result.data.count;
                console.log("[countProducts] - END - Handle: [%s] count [%d]", handle, count);
                resolve(count);
            })
            .catch(error => {
                reject(error);
            });
    });

}

function postProductThrottler(obj, i) {
    return new Promise((resolve, reject) => {
        sleeper(500 * i, i) //note 500*i - this is important. Cannot have a constant, say 500 ms here or it will not work.
            //Best explanation I found for this is here https://stackoverflow.com/questions/30514584/delay-each-loop-iteration-in-node-js-async
            // See comments within chosen answer
            .then((x) => {
                postProduct(obj)
                    .then((result => {
                        resolve(result);
                    }));
            })
    })
}

function postProduct(obj) {
    return new Promise(function(resolve, reject) {
        console.log("[postProduct] - START - HANDLE: " + obj.product.handle);
        //console.log("[postProduct] - PRODUCT: %O", obj.product);
        countProducts(obj.product.handle)
            .then(count => {
                console.log("[postProduct] - HANDLE [%s] COUNT [%s]", obj.product.handle, count);
                if (count === 0) {
                    var api = API_POST_PRODUCT;
                    axios.post(api, obj, CONFIG)
                        .then(result => {
                            const shopifyProduct = result.data.product;
                            console.log("[postProduct] - END - HANDLE: [%s] SHOPIFY_ID: [%s]", obj.product.handle, shopifyProduct.id);
                            resolve({ data: { status: 'success', product: shopifyProduct } });
                        })
                        .catch(error => {
                            reject(error);
                        });
                }
                else {
                    console.log("[postProduct] - END - HANDLE: [%s] SHOPIFY_ID: [N/A]", obj.product.handle);
                    resolve({ status: 'failure', error: 'Possible duplicate product with handle [' + obj.product.handle + ']' });
                }

            })
            .catch(error => {
                reject(error);
            })
    });
}

function deleteProduct(id) {
    const url = R.replace("$id", id, API_PRODUCT_BASE)
    const request = {
        method: 'delete',
        url,
        auth
    }
    return axios(request)

}

function putProductQuantity(obj, isAbsolute) {
    const { product_id, variant_id, qtd } = obj
    const variant = isAbsolute ? { id: variant_id, inventory_quantity: qtd } : { id: variant_id, inventory_quantity_adjustment: qtd }
    const variants = [variant]
    const product = { id: product_id, variants }
    const data = { product }

    const url = R.replace("$id", product_id, API_PRODUCT)
    const request = {
        method: 'put',
        url,
        data,
        auth
    }
    console.log('[putProductQuantity] - Request ' + request.url)
    return axios(request)
}

function postOrder(order) {
    const url = API_ORDERS_POST;
    console.log('[postOrder] - Request ' + url)
    return axios.post(url, order, CONFIG)
}

function postTransactionForOrder(order_id, tran) {
    const url = R.replace("$id", order_id, API_TRANSACTIONS_FOR_ORDER)
    console.log('[postTransactionForOrder] - Request ' + url)
    return axios.post(url, tran, CONFIG)
}

function getAllOrderIds() {
    const url = API_ORDERS + '&fields=id'
    console.log('[getAllOrderIds] - Request ' + url)
    return axios.get(url, CONFIG)
}

function deleteOrder(order_id) {
    const url = R.replace("$id", order_id, API_DELETE_ORDER)
    console.log('[deleteOrder] - Request ' + url)
    if (url.indexOf('test') === -1) {
        throw "Seems like you want to delete orders in production??? Not allowed..."
    }
    else {
        return axios.delete(url, CONFIG)
    }
}

function addNewProduct(product, index) {

    const handle = R.pipe(R.concat(product.product_type), R.concat(product.my_sku))("-")
    const title = product.title //"18k Gold Plated Earrings",
    const body_html = product.body_html
    const product_type = product.product_type
    const vendor = "Simone"
    const tags = "april_21"
    const published = false
    const sku = product.my_sku
    const inventory_management = "shopify"
    const inventory_quantity = product.qtd
    const inventory_policy = "deny"
    const fulfillment_service = "manual"
    const price = product.sale_price
    const requires_shipping = true
    const taxable = false
    const cost_in_real = product.cost_in_real
    const exchange_rate = product.exchange_rate
    const cost_in_aussie_dolar = product.cost_in_aud
    const p = {
        handle,
        title,
        body_html,
        vendor,
        product_type,
        tags,
        published,
        cost_in_real,
        cost_in_aussie_dolar,
        sku,
        inventory_management,
        inventory_quantity,
        inventory_policy,
        fulfillment_service,
        price,
        requires_shipping,
        taxable,
        cost_in_real,
        cost_in_aussie_dolar
    }
    const shopifyProduct = convertToShopifyProduct(p)
    return postProductThrottler(shopifyProduct, index + 1)
}

function convertToShopifyProduct(obj) {
    const { handle, title, body_html, vendor, product_type, tags, published, cost_in_real, cost_in_aussie_dolar, ...variantObject } = obj;
    const variants = [variantObject];
    const metafields = [{
            "namespace": "cogs",
            "key": "cost_in_real",
            "value": cost_in_real,
            "value_type": "string"
        },
        {
            "namespace": "cogs",
            "key": "cost_in_aussie_dolar",
            "value": cost_in_aussie_dolar,
            "value_type": "string"
        },
        {
            "namespace": "cogs",
            "key": "exchange_rate",
            "value": cost_in_aussie_dolar / cost_in_real,
            "value_type": "string"
        }
    ];
    return { product: { handle, title, body_html, vendor, product_type, tags, published, variants, metafields } };
}




module.exports = {
    getProduct,
    getOrder,
    getOrdersToSynch,
    getProductsToSynch,
    getOrderTransactions,
    convertToShopifyProduct,
    postProduct,
    countProducts,
    postProductThrottler,
    putProductQuantity,
    addNewProduct,
    deleteProduct,
    postOrder,
    postTransactionForOrder,
    getAllOrderIds,
    deleteOrder
};
