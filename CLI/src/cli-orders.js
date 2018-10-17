const axios = require('axios')
const R = require('ramda')
const login = require('./cli-login')
const config = require('./cli-config')
const logger = require('./log')


function countOrders(cmd) {
    return new Promise((resolve, reject) => {

        logger.setLogLevel(cmd.debug ? 5 : 1)
        logger.info(`[countOrders] START - DEBUG [${cmd.debug}] - REMOTE [${cmd.remote}]`)
        login.getToken()
            .then(token => {
                // all good with login. Call the end point now
                var url = cmd.remote ? config.localURLS.remoteSellOrderCountURL :
                                       config.localURLS.localSellOrderCountURL;
                logger.debug(`Calling [${url}]`)
                axios.get(url, { headers: { 'x-access-token': token } })
                    .then(result => {
                        logger.info(`[countOrders] - DONE`)
                        logger.log('RESULT: ' + result.data)
                        resolve(result);
                    })
                    .catch(error => {
                        logger.error(`(3) : ${error}`)
                        logger.error(`(3) : Status: ${error.response.status} - ${error.response.statusText}`)
                        logger.error(`(3) : ${JSON.stringify(error.response.data, null, 4)}`)
                    })
            })
            .catch(error => {
                if (error.response) {
                    logger.error(`(2) : ${error}`)
                    logger.error(`(2) : Status: ${error.response.status} - ${error.response.statusText}`)
                    logger.error(`(2) : ${JSON.stringify(error.response.data, null, 4)}`)
                } else {
                    logger.error(`(1) \n\n${error}\n\n`)
                }
            })
    })
}

function createDummyOrder(cmd) {
    return new Promise((resolve, reject) => {
        logger.setLogLevel(cmd.debug ? 5 : 1)
        logger.info(`[createDummyOrder] START - DEBUG [${cmd.debug}]`)
        login.getToken()
            .then(token => {
                // all good with login. Call the end point now
                logger.debug(`Calling [${config.localURLS.postDummyOrder}]`)
                axios.get(config.localURLS.postDummyOrder, { headers: { 'x-access-token': token } })
                    .then(orderId => {
                        logger.info(`[createDummyOrder] - DONE`)
                        logger.log('Order Id: ' + orderId.data)
                        resolve(orderId.data);
                    })
                    .catch(error => {
                        logger.error(`(1) : ${error}`)
                        logger.error(`(1) : Status: ${error.response.status} - ${error.response.statusText}`)
                        logger.error(`(1) : ${JSON.stringify(error.response.data, null, 4)}`)
                        //reject(error)
                    })
            })
            .catch(error => {
                if (error.response) {
                    logger.error(`(2) : ${error}`)
                    logger.error(`(2) : Status: ${error.response.status} - ${error.response.statusText}`)
                    logger.error(`(2) : ${JSON.stringify(error.response.data, null, 4)}`)
                } else {
                    logger.error(`(3) \n\n${JSON.stringify(error, null, 4)}\n\n`)
                }
            })
    })
}

module.exports = { countOrders, createDummyOrder }
