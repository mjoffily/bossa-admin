const moment = require('moment');

// Here we have 3 products. 2 have cogs, 1 does not
const products_1 = [    {
        "_id": "5b0f094ae7e7dafc7d2e576d",
        "id": 52799569940,
        "product": {
            "id": 52799569940,
            "created_at": "2017-12-07T22:42:36+11:00",
            "updated_at": "2018-05-28T19:55:00+10:00",
            "variants": [
                {
                    "id": 658801000468,
                    "product_id": 52799569940,
                    "price": "17.00",
                    "sku": "BA2151FO_GO",
                    "created_at": "2017-12-07T22:42:36+11:00",
                    "updated_at": "2018-05-28T19:55:00+10:00",
                    "inventory_item_id": 661633073172,
                    "cogs": null
                }
            ],
            "image": {
                "id": 317823975444,
                "product_id": 52799569940,
                "created_at": "2017-12-07T22:42:36+11:00",
                "updated_at": "2017-12-07T22:42:36+11:00",
                "src": "https://cdn.shopify.com/s/files/1/2209/8535/products/BA2151FO_GO.jpg?v=1512646956"
            }
        }
    },
    {
        "_id": "5b0f094ae7e7dafc7d2e576e",
        "id": 11362986452,
        "product": {
            "id": 11362986452,
            "created_at": "2017-08-07T19:11:58+10:00",
            "updated_at": "2018-02-11T21:50:41+11:00",
            "variants": [
                {
                    "id": 47830774036,
                    "product_id": 11362986452,
                    "price": "49.00",
                    "sku": "BA2127FO_g",
                    "created_at": "2017-08-07T19:11:58+10:00",
                    "updated_at": "2017-10-15T18:32:47+11:00",
                    "inventory_item_id": 36067322004,
                    "cogs": [
                        {
                            "dateFrom": new Date("2000-01-01"),
                            "dateTo": new Date("9999-01-01"),
                            "costSourceCurrency": 56,
                            "cost": 22.4,
                            "handlingCost": 1,
                            "exchangeRate": 0
                        }
                    ]
                }
            ],
            "image": {
                "id": 29910992724,
                "product_id": 11362986452,
                "created_at": "2017-08-07T19:11:58+10:00",
                "updated_at": "2017-08-07T19:11:58+10:00",
                "src": "https://cdn.shopify.com/s/files/1/2209/8535/products/BA2127FO_g.jpg?v=1502097118",
            }
        }
    },
    {
        "_id": "5b0f094ae7e7dafc7d2e576f",
        "id": 43767431188,
        "product": {
            "id": 43767431188,
            "created_at": "2017-11-28T06:58:20+11:00",
            "updated_at": "2018-05-28T02:17:35+10:00",
            "variants": [
                {
                    "id": 524092833812,
                    "product_id": 43767431188,
                    "price": "30.00",
                    "sku": "MCR88A_g_sand",
                    "created_at": "2017-11-28T06:58:20+11:00",
                    "updated_at": "2018-05-28T02:17:35+10:00",
                    "cogs": [
                        {
                            "dateFrom": new Date("2000-01-01"),
                            "dateTo": new Date("9999-01-01"),
                            "costSourceCurrency": 27,
                            "cost": 10.8,
                            "handlingCost": 1,
                            "exchangeRate": 0
                        }
                    ]
                }
            ],
            "image": {
                "id": 263516913684,
                "product_id": 43767431188,
                "created_at": "2017-11-28T06:58:20+11:00",
                "updated_at": "2017-11-28T06:58:20+11:00",
                "src": "https://cdn.shopify.com/s/files/1/2209/8535/products/MCR88A_g_sand_2.jpg?v=1511812700",
            }
        }
    }
]

// Here we have 2 products. Both have cogs. Used to test case when query returning items without COGS has zero entries
const products_2 = [    
    {
        "_id": "5b0f094ae7e7dafc7d2e576e",
        "id": 11362986452,
        "product": {
            "id": 11362986452,
            "created_at": "2017-08-07T19:11:58+10:00",
            "updated_at": "2018-02-11T21:50:41+11:00",
            "variants": [
                {
                    "id": 47830774036,
                    "product_id": 11362986452,
                    "price": "49.00",
                    "sku": "BA2127FO_g",
                    "created_at": "2017-08-07T19:11:58+10:00",
                    "updated_at": "2017-10-15T18:32:47+11:00",
                    "inventory_item_id": 36067322004,
                    "cogs": [
                        {
                            "dateFrom": new Date("2000-01-01"),
                            "dateTo": new Date("9999-01-01"),
                            "costSourceCurrency": 56,
                            "cost": 22.4,
                            "handlingCost": 1,
                            "exchangeRate": 0
                        }
                    ]
                }
            ],
            "image": {
                "id": 29910992724,
                "product_id": 11362986452,
                "created_at": "2017-08-07T19:11:58+10:00",
                "updated_at": "2017-08-07T19:11:58+10:00",
                "src": "https://cdn.shopify.com/s/files/1/2209/8535/products/BA2127FO_g.jpg?v=1502097118",
            }
        }
    },
    {
        "_id": "5b0f094ae7e7dafc7d2e576f",
        "id": 43767431188,
        "product": {
            "id": 43767431188,
            "created_at": "2017-11-28T06:58:20+11:00",
            "updated_at": "2018-05-28T02:17:35+10:00",
            "variants": [
                {
                    "id": 524092833812,
                    "product_id": 43767431188,
                    "price": "30.00",
                    "sku": "MCR88A_g_sand",
                    "created_at": "2017-11-28T06:58:20+11:00",
                    "updated_at": "2018-05-28T02:17:35+10:00",
                    "cogs": [
                        {
                            "dateFrom": new Date("2000-01-01"),
                            "dateTo": new Date("9999-01-01"),
                            "costSourceCurrency": 27,
                            "cost": 10.8,
                            "handlingCost": 1,
                            "exchangeRate": 0
                        }
                    ]
                }
            ],
            "image": {
                "id": 263516913684,
                "product_id": 43767431188,
                "created_at": "2017-11-28T06:58:20+11:00",
                "updated_at": "2017-11-28T06:58:20+11:00",
                "src": "https://cdn.shopify.com/s/files/1/2209/8535/products/MCR88A_g_sand_2.jpg?v=1511812700",
            }
        }
    }
]

// Here we have 2 products. Both have cogs. Used to test case when query returning items without COGS has zero entries
const today = moment().subtract(5, 'days').startOf('day');
const nearFuture = today.clone().add(4, 'days').toDate()
const specificDate = moment("2000-03-27").toDate()
console.log(today.toDate())
console.log(nearFuture)
console.log(specificDate)
const products_3 = [    
    {
        "_id": "5b0f094ae7e7dafc7d2e576e",
        "id": 11362986452,
        "product": {
            "id": 11362986452,
            "created_at": "2017-08-07T19:11:58+10:00",
            "updated_at": "2018-02-11T21:50:41+11:00",
            "variants": [
                {
                    "id": 47830774036,
                    "product_id": 11362986452,
                    "price": "49.00",
                    "sku": "BA2127FO_g",
                    "created_at": "2017-08-07T19:11:58+10:00",
                    "updated_at": "2017-10-15T18:32:47+11:00",
                    "inventory_item_id": 36067322004,
                    "cogs": [
                        {
                            "dateFrom": moment().subtract(20, 'days').startOf('day').toDate(),
                            "dateTo": moment().subtract(10, 'days').startOf('day').toDate(),
                            "costSourceCurrency": 1,
                            "cost": 1,
                            "handlingCost": 1,
                            "exchangeRate": 1
                        },
                        {
                            "dateFrom": moment().subtract(9, 'days').startOf('day').toDate(),
                            "dateTo": moment().subtract(1, 'days').startOf('day').toDate(),
                            "costSourceCurrency": 2,
                            "cost": 2,
                            "handlingCost": 2,
                            "exchangeRate": 2
                        },
                        {
                            "dateFrom": moment().startOf('day').toDate(),
                            "dateTo": moment().add(5, 'years').startOf('day').toDate(),
                            "costSourceCurrency": 3,
                            "cost": 3,
                            "handlingCost": 3,
                            "exchangeRate": 3
                        }
                    ]
                }
            ],
            "image": {
                "id": 29910992724,
                "product_id": 11362986452,
                "created_at": "2017-08-07T19:11:58+10:00",
                "updated_at": "2017-08-07T19:11:58+10:00",
                "src": "https://cdn.shopify.com/s/files/1/2209/8535/products/BA2127FO_g.jpg?v=1502097118",
            }
        }
    }
]

module.exports = {products_1, products_2, products_3}
