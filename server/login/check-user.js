var Promise = require('bluebird');
var bcrypt = require('bcrypt');
var conn = require('../routes/db.helper');


function checkPassword(userid, plainTextPassword) {
    return new Promise((resolve, reject) => {
        conn.connect()
        .then( (db) => {
            
            db.collection(conn.USERS).find({userid: userid}).toArrayAsync()
            
            .then( (userObj) => {
            
                const { userid, password } = userObj[0];
                
                console.debug("user {%s} found", userid);
                bcrypt.compare(plainTextPassword, password)
                .then( (res) => {
                    console.log("Result %s", res);
                    if (res) {
                        resolve(true);
                    } else {
                        reject({status: 'check complete', error_msg: 'invalid userid and password combination'});
                    }
                })
                .catch( (error) => {
                    console.error("ERROR: %s", error);
                    reject(error);
                })

            })
            .catch( (error) => {
                console.log("User Not Found %s %s ", userid, JSON.stringify(error, null, 4));
                reject({status: 'check complete', error_msg: 'invalid userid and password combination'});
            })
        })
        .catch( (error) => {
            console.log("ERROR connecting to database [%s] ", userid, JSON.stringify(error, null, 4));
            reject(false);
        })
    })
}


module.exports = { checkPassword: checkPassword }

// if (process.argv.length < 4) {
//      console.error('Invalid parameters. Usage [node %s <userid> <password>', process.argv[1]);
//      return; 
// }
// const userid = process.argv[2];
// const password = process.argv[3];
// checkPassword(userid, password).then( (res) => process.exit(0)).catch( (error) => process.exit(1));
