require('colors')
const {ERROR, WARNING, INFO, SUCCESS, DEBUG} = require('./constants/log-levels')

var logLevel = DEBUG;

const setLogLevel = (level) => {
    logLevel = level;
}

const info = (message) => {
    if (logLevel < INFO) {
        return
    }
    
    log(message, INFO)
}

const debug = (message) => {
    if (logLevel < DEBUG) {
        return
    }
    
    log(message, DEBUG)
}

const warn = (message) => {
    if (logLevel < WARNING) {
        return
    }
    
    log(message, WARNING)
}

const error = (message) => {
    log(message, ERROR)
}

const log = (message, type) => {
    if (logLevel === 'silent') {
        return;
    }
    let colorMessage;
    switch(type) {
        case ERROR: 
            colorMessage = `[ERROR] ${message}`.red;
            break;
        case DEBUG: 
            colorMessage = `[DEBUG] ${message}`.cyan;
            break;
        case WARNING: 
            colorMessage = `[WARN] ${message}`.yellow;
            break;
        case INFO: 
            colorMessage = `[INFO] ${message}`.blue;
            break;
        case SUCCESS: 
            colorMessage = `${message}`.green;
            break;
        default: 
            colorMessage = message.inverse;
    }

    console.log(colorMessage);
}

module.exports = {info, debug, warn, error, log, setLogLevel};
