const winston = require('winston')
let date = new Date().toISOString();
const logFormat = winston.format.printf(function(info) {
    //console.log(info)
  return `${date}-${info.level}: ${JSON.stringify(info.message, null, 4)}\n`;
});

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log` 
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.Console({  json: true,
     //stringify: (obj) => JSON.stringify(obj, null, 20),
     format: winston.format.combine(winston.format.colorize(), logFormat), prettyPrint: true }),
        //new winston.transports.File({ filename: 'error.log', level: 'error' }),
        //new winston.transports.File({ filename: 'combined.log' })
    ]
})

module.exports = { logger }
