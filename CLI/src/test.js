var log = require('loglevel');
log.setLevel('debug')

function funct3(x) {
  return new Promise((resolve, reject) => {
    log.info("funct3 (%s) in promise", x)
    resolve('ok')
  })

}

function funct2() {
  return new Promise((resolve, reject) => {
    log.info("funct2 in promise")
    funct3('1').then(b => {
      log.info("funct2 - 1 - completed funct3 promise")
      funct3('2').then(h => {
        log.info("funct2 - 2 - completed funct3 promise")
      })
      resolve('ok')
    })
  })
}

function funct1() {
  return new Promise((resolve, reject) => {
    log.info("funct1 - before promise")
    funct2().then((r) => {
      log.info('funct1 - completed')
    })
  })
}
funct1()
