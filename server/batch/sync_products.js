const axios = require('axios');
const R = require('ramda')

const config = require('../_config');

console.log('NODE ENV: %s', process.env.NODE_ENV);
const env = R.defaultTo('dev', process.env.NODE_ENV);
console.log('Environment: %s', env);

const apiBaseUrl = `http://${config.appBaseURI[env]}`;
const loginUrl = `${apiBaseUrl}/login`;
const synchProductsUrl = `${apiBaseUrl}/synch-products`;
//const synchProductsUrl = `${apiBaseUrl}/products-to-be-synched`;



function run() {
    console.log('RUNNING Synch of PRODUCTS')
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
                axios.get(synchProductsUrl, { headers: { 'x-access-token': token } })
                    .then(result => {
                        console.log('RESULT: ' + JSON.stringify(result.data, null, 4))
                        return result;
                    })
                    .catch(error => {
                        console.log('ERROR (2) : %s', error)
                        console.log('ERROR (2) : Status: %s - %s ', error.response.status, error.response.statusText)
                        console.log('ERROR (2) : %s', JSON.stringify(error.response.data, null, 4))
                    })

            }
        })
        .catch(error => {
            console.log('ERROR (1) : %s', error)
            console.log('ERROR (1) : Status: %s - %s ', error.response.status, error.response.statusText)
            console.log('ERROR (1) : %s', JSON.stringify(error.response.data, null, 4))
        })
}

run()
