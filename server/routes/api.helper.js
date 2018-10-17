var twilio = require('twilio');
var Promise = require('bluebird');
var fs = require('fs');
const config = require('../_config')

const accountSid = config.getSecret('twilio_user');
const authToken = config.getSecret('twilio_token');
const fromPhone = config.getSecret('twilio_mobile');
const toPhone = config.getSecret('sms_to');
const danielaMobile = config.getSecret('mobile_D');


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

function writeToFile(file, data) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(file, data, function(err) {
            if (err) {
                reject(err)
                return;
            }
            resolve('ok');
            console.log("The file was saved!")
        })
    })
}

function countSuccess(accummulator, currentValue) {
    if (currentValue.status === 'success') {
        accummulator.success_count = accummulator.success_count + 1;
    }
    else {
        accummulator.failed_count = accummulator.failed_count + 1;
    }
    return accummulator;
}

function sendSMS(msg, toDani) {
    var client = new twilio(accountSid, authToken);
    const phone = toDani ? danielaMobile : toPhone
    console.log("toDani: %s", toDani)
    console.log("The phone: %s", danielaMobile)
    return client.messages.create({
        body: `${msg} \n\nENV: ${config.env}`,
        to: phone,
        from: fromPhone
    })
}

module.exports = {
    printJson,
    countSuccess,
    writeToFile,
    sendSMS
};
