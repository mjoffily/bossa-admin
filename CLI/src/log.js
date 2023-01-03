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

function printJson(obj) {
    return new Promise((resolve, reject) => {

        var cache = [];
        var str = JSON.stringify(obj, function(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        }, 4);
        cache = null; // Enable garbage collection

        console.log(str);
        resolve(str);
    })
}
module.exports = {info, debug, warn, error, log, setLogLevel, printJson};
