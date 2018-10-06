const R = require('ramda')
const axios = require('axios')
const config = require('./cli-config')
const logger = require('./log')

function getToken() {
    return new Promise((resolve, reject) => {

        logger.info('[getToken] START')
        const userid = config.getSecret('batch_user');
        const password = config.getSecret('batch_pwd');
        logger.debug(`user [${userid}], pwd[****]`)
        // login first to get a token
        axios.post(config.localURLS.loginURL, { userid, password })
            .then(response => {
                const data = R.pathOr({}, ['data', 'data'], response)
                const { status, token } = data;
                if (status) {
                    logger.debug(`Login successful!! \n\n\t[${JSON.stringify(data)}\n\n`)
                    resolve(token)
                } else {
                    logger.warn(`Login failed!!`)
                    reject(data)
                }
            })
            .catch(error => {
                reject(error)
            })
    })
}

module.exports = { getToken }
