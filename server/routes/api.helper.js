var Promise = require('bluebird');

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
        });
        cache = null; // Enable garbage collection
        
        console.log(str);
        resolve();
    })
}

function countSuccess(accummulator, currentValue) {
    if (currentValue.success) {
        accummulator.success_count = accummulator.success_count + 1;
    } else {
        accummulator.failed_count = accummulator.failed_count + 1;
    }
    return accummulator;
}

module.exports = {printJson: printJson
 , countSuccess: countSuccess
};