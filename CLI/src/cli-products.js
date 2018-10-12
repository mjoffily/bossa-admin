const axios = require('axios')
const R = require('ramda')
const login = require('./cli-login')
const config = require('./cli-config')
const logger = require('./log')

function run(cmd) {
    //logger.printJson(cmd)
    //return
    return new Promise((resolve, reject) => {

        logger.setLogLevel(cmd.debug ? 5 : 1)
        logger.info(`[countLocal] START - DEBUG [${cmd.debug}]`)
        login.getToken()
            .then(token => {
                // all good with login. Call the end point now
                getProductsLocal(token)
                    .then(result => {
                        const {data} = result;
                        if (cmd.published === 'y' || cmd.published === 'Y') {
                            logger.debug('only published')
                            const publishedProducts = R.filter(data, )
                        }
                        if (cmd.count) {
                            logger.log('RESULT: ' + data.length)
                        } else {
                            logger.log('RESULT: ' + JSON.stringify(result.data, null, 4))
                        }
                        logger.info(`[products] - DONE`)
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
                }
                else {
                    logger.error(`(1) \n\n${JSON.stringify(error, null, 4)}\n\n`)
                }
            })
    })
}

function getProductsLocal(token) {
    // all good with login. Call the end point now
    logger.debug(`Calling [${config.localURLS.localProducts}]`)
    return axios.get(config.localURLS.localProducts, { headers: { 'x-access-token': token } })
}

module.exports = { run }
