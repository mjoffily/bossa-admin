const R = require('ramda')
const logger = require('./log')
const helper = require('../../server/routes/api.helper')


function run(msg, cmd) {
    return new Promise((resolve, reject) => {
        logger.setLogLevel(cmd.debug ? 5 : 1)
        logger.info(`[sms] START - DEBUG [${cmd.debug}]`)
        logger.debug(`message to send [${msg}]`)
        cmd.daniela ? helper.sendSMS(msg, true) : helper.sendSMS(msg, false)
        .then(message => logger.debug(JSON.stringify(message)))
        .catch(error => logger.error(JSON.stringify(error)))
    })
}

module.exports = { run }
