const shopify = require('../routes/api.shopify');

function setupNewDummyProduct() {

    const product_handle = 'dummy_' + new Date();
    const product = {
        "product": {
            "handle": product_handle,
            "title": product_handle,
            "body_html": "<strong>Good snowboard!</strong>",
            "vendor": "Burton",
            "product_type": "Snowboard",
            "tags": "Barnes & Noble, John's Fav, &quot;Big Air&quot;"
        }
    }
    shopify.postProduct(product).then(result => {
        console.log('---------------')
        console.log('!!! Success !!!')
        console.log('---------------')
        console.log(JSON.stringify(result, null, 4))
    })
    .catch(error => {
        console.log('ERROR: ' + error)
    })
}

setupNewDummyProduct()
