const axios = require('axios');
const R = require('ramda')

const config = require('../_config');

const apiBaseUrl = 'http://localhost:8080/api';
const loginUrl = `${apiBaseUrl}/login`;
const synchOrdersUrl = `${apiBaseUrl}/synch-orders`;



// get latest update date

// retrieve sell orders 
function run() {
    const userid = config.getSecret('batch_user');
    const password = config.getSecret('batch_pwd');
    // login first to get a token
    axios.post(loginUrl, { userid, password })
        .then(response => {
            const data = R.pathOr({}, ['data', 'data'], response)
            const { status, error_msg, token } = data;
            console.log(data)
            if (status) {
                // all good with login. Call the end point now
               axios.get(synchOrdersUrl, {headers: { 'x-access-token': token }} )
               .then(result => {
                   console.log(result.data)
                   return result;
               })
               .catch(error => {
                   console.log(error)
               })
                
            }
        })
        .catch(error => {
            console.log(error);
        })
}

run()
