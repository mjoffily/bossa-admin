var Promise = require('bluebird');
var bcrypt = require('bcrypt');
var conn = require('../routes/db.helper');

function register(userid, plainTextPassword) {
    return new Promise((resolve, reject) => {
        const saltRounds = 4;
        bcrypt.hash(plainTextPassword, saltRounds)
        .then( (hash) => {
            conn.connect()
            .then( (db) => {
                db.collection(conn.USERS).updateAsync({userid: userid}, {userid: userid, password: hash, created_date: new Date()}, {upsert: true})
                .then( () => {
                    console.log("user %s updated successfully", userid);
                    resolve();
                })
                .catch( (error) => {
                    console.log("ERROR updating user %s %s ", userid, JSON.stringify(error, null, 4));
                    reject(error);
                })
            })
            .catch( (error) => {
                console.log("ERROR connecting to database [%s] ", userid, JSON.stringify(error, null, 4));
                reject(error);
            })
                
        });
    })
}

if (process.argv.length < 4) {
     console.error('Invalid parameters. Usage [node %s <userid> <password>', process.argv[1]);
     return; 
}
const userid = process.argv[2];
const password = process.argv[3];
register(userid, password).then( () => process.exit(0)).catch( (error) => process.exit(1));
