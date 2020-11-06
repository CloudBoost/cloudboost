const chalk = require('chalk')
const puppeteer = require('puppeteer')
const fs = require('fs')
const mkdirp = require('mkdirp')
const os = require('os')
const path = require('path')

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup')
const environment = process.argv[3]

module.exports = async () => {
  console.log(chalk.green('Setup Puppeteer'))
  let browser = null
  if (environment === 'local') {
    browser = await puppeteer.launch({})
  } else {
    browser = await puppeteer.connect({
      browserWSEndpoint: process.env['CHROMELESS_PORT_3000_TCP_ADDR'] && process.env['CHROMELESS_PORT_3000_TCP_PORT']
        ? 'ws://' + process.env['CHROMELESS_PORT_3000_TCP_ADDR'] + ':' + process.env['CHROMELESS_PORT_3000_TCP_PORT'] : 'ws://localhost:3030'
    })
  }
  // This global is not available inside tests but only in global teardown
  global.__BROWSER_GLOBAL__ = browser
  // Instead, we expose the connection details via file system to be used in tests
  mkdirp.sync(DIR)
  fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint())
}
