mongoexport --db bossa --collection users --out ./exports/user.json 
mongoexport --db bossa --collection products --out ./exports/products.json 
mongoexport --db bossa --collection orders --out ./exports/orders.json 
mongoexport --db bossa --collection purchase_orders --out ./exports/purchase_orders.json 
mongoexport --db bossa --collection counters --out ./exports/counters.json 
mongoexport --db bossa --collection requests --out ./exports/requests.json 
mongoexport --db bossa --collection lastupdate --out ./exports/lastupdate.json 
