const R = require('ramda')
const shopify = require('../routes/api.shopify');
const helper = require('../routes/api.helper');

function setupNewDummyOrder(saveError = false) {

    const order = {
        "order": {
            "email": "thereason1000@gmail.com",
            "fulfillment_status": "fulfilled",
            //"financial_status": "success",
            "send_receipt": true,
            "send_fulfillment_receipt": true,
            "line_items": [{
                "variant_id": 16886778626105,
                "quantity": 1
            }],
            "transactions": [{
                "kind": "authorization",
                "status": "success",
                "amount": 50.0
            }]
        }
    }

    const tran = {
        "transaction": {
            "amount": "10.00",
            "kind": "capture",
            "gateway": "manual",
            "test": true
        }
    }

    shopify.postOrder(order).then(result => {
            console.log('---------------')
            console.log('!!! Success - Order Created !!!')
            console.log('---------------')
            console.log(JSON.stringify(result.data, null, 4))
            const id = result.data.order.id;

            // post the payment transaction associated with this dummy order
            //      const id = 717509656633;
            shopify.postTransactionForOrder(id, tran)
                .then(tranResult => {
                    console.log('---------------')
                    console.log('!!! Success - TRANSACTION Created !!!')
                    console.log('---------------')
                })
                .catch(error => {
                    if (saveError) {
                        helper.printJson(error.response).then(res => {
                            helper.writeToFile('/tmp/obj2.js', res).then(res => {
                                console.log('ERROR object saved to /tmp/obj.js')
                            })

                        })
                    }
                    console.log('ERROR (2) : Status: %s - %s ', error.response.status, error.response.statusText)
                    console.log('ERROR (2) : %s', JSON.stringify(error.response.data, null, 4))
                })
        })
        .catch(error => {
            console.log('ERROR (1) : Status: %s - %s ', error.response.status, error.response.statusText)
            console.log('ERROR (1) : %s', JSON.stringify(error.response.data, null, 4))
        })
}



function deleteAllOrders(order_id) {

    shopify.getAllOrderIds()
        .then(result => {
            console.log('All order ids: ', result.data)

            const ids = R.map(obj => obj.id, result.data.orders)
            const list = R.map(shopify.deleteOrder, ids)
            Promise.all(list)
                .then(orderDeleteResult => {
                    // TODO Display more meaningful result 
                    console.log('Deleted results: ', orderDeleteResult)
                })
                .catch(error => {
                    console.log('ERROR (2) : %s', error)
                    console.log('ERROR (2) : Status: %s - %s ', error.response.status, error.response.statusText)
                    console.log('ERROR (2) : %s', JSON.stringify(error.response.data, null, 4))
                })

        })
        .catch(error => {
            console.log('ERROR (1) : %s', error)
            console.log('ERROR (1) : Status: %s - %s ', error.response.status, error.response.statusText)
            console.log('ERROR (1) : %s', JSON.stringify(error.response.data, null, 4))
        })
}

setupNewDummyOrder()
//deleteAllOrders()
