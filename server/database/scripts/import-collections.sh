#mongoimport --db bossa --collection users --file ./exports/user.json --jsonArray
#mongoimport --verbose --db bossa --collection products --file ./exports/products.json --jsonArray
mongoimport --db bossa --collection orders --file ./exports/orders.json --jsonArray
#mongoimport --db bossa --collection purchase_orders --file ./exports/purchase_orders.json --jsonArray
#mongoimport --db bossa --collection counters --file ./exports/counters.json --jsonArray
#mongoimport --db bossa --collection requests --file ./exports/requests.json --jsonArray
#mongoimport --db bossa --collection lastupdate --file ./exports/lastupdate.json --jsonArray
