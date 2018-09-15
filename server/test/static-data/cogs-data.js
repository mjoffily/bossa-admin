  const cogs_1 = {
    product_id: 1,
    variant_id: 2,
    cogs: [{
        date_from: new Date('2017-06-04'),
        date_to: new Date('2017-06-23'),
        cost_in_real: 10,
        cost_in_aud: 10,
        handling_cost: 10,
        exchange_rate: 10
      },
      {
        date_from: new Date('2017-06-24'),
        date_to: new Date('9999-12-31'),
        cost_in_real: 1,
        cost_in_aud: 1,
        handling_cost: 1,
        exchange_rate: 1
      }
    ]
  }

  module.exports = { cogs_1 }
  