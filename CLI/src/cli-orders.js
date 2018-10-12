const axios = require('axios')
const R = require('ramda')
const login = require('./cli-login')
const config = require('./cli-config')
const logger = require('./log')


function countLocal(cmd) {
    return new Promise((resolve, reject) => {

        logger.setLogLevel(cmd.debug ? 5 : 1)
        logger.info(`[countLocal] START - DEBUG [${cmd.debug}]`)
        login.getToken()
            .then(token => {
                // all good with login. Call the end point now
                logger.debug(`Calling [${config.localURLS.localSellOrderCountURL}]`)
                axios.get(config.localURLS.localSellOrderCountURL, { headers: { 'x-access-token': token } })
                    .then(result => {
                        logger.info(`[countLocal] - DONE`)
                        logger.log('RESULT: ' + result.data)
                        resolve(result);
                    })
                    .catch(error => {
                        logger.error(`(2) : ${error}`)
                        logger.error(`(2) : Status: ${error.response.status} - ${error.response.statusText}`)
                        logger.error(`(2) : ${JSON.stringify(error.response.data, null, 4)}`)
                        //reject(error)
                    })
            })
            .catch(error => {
                if (error.response) {
                    logger.error(`(2) : ${error}`)
                    logger.error(`(2) : Status: ${error.response.status} - ${error.response.statusText}`)
                    logger.error(`(2) : ${JSON.stringify(error.response.data, null, 4)}`)
                } else {
                    logger.error(`(1) \n\n${JSON.stringify(error, null, 4)}\n\n`)
                }
            })
    })
}

module.exports = { countLocal }
