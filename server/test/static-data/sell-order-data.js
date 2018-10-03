const moment = require('moment')

const SELL_ORDERS_BASIC = [{
        "id": 717579354169,
        "order": {
            "id": 717579354169,
            "email": "thereason1000@gmail.com",
            "closed_at": moment('2017-06-04').startOf('day').toDate(),
            "created_at": moment('2017-06-04').startOf('day').toDate(),
            "updated_at": moment('2017-06-04').startOf('day').toDate(),
        }
    },
    {
        "id": 717578141753,
        "order": {
            "id": 717578141753,
            "email": "thereason1000@gmail.com",
            "closed_at": moment('2017-06-05').startOf('day').toDate(),
            "created_at": moment('2017-06-05').startOf('day').toDate(),
            "updated_at": moment('2017-06-05').startOf('day').toDate(),
        }
    },
    {
        "id": 717620674617,
        "order": {
            "id": 717620674617,
            "email": "thereason1000@gmail.com",
            "closed_at": moment('2017-06-26').startOf('day').toDate(),
            "created_at": moment('2017-06-26').startOf('day').toDate(),
            "updated_at": moment('2018-12-26').startOf('day').toDate(),
        }
    }
]
module.exports = {SELL_ORDERS_BASIC}