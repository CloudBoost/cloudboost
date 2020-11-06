import faker from 'faker'
// import puppeteer from 'puppeteer'
import keys from './keys'

// Global Variables
const environment = process.argv[3]

// Given Miscellanous loading time for the webpage
jest.setTimeout(120000)

// Tests on Accounts UI

/* ******* Signup  ******* */
describe('Test running', () => {
  let page
  beforeAll(async () => {
    page = await global.__BROWSER__.newPage()
  }, 50000)

  afterAll(async () => {
    await page.close()
  })

  describe('Signup', () => {
    test('it should not register when name,email or password is null', async () => {
      await page.goto(keys[environment].links.ACCOUNTS_URL + 'signup')
      await page.waitForSelector('#SignupName', {
        timeout: 120000
      })
      await page.type('#SignupName', keys[environment].test_invalidUser.name)
      await page.type('#SignupPassword', keys[environment].test_invalidUser.password)
      await page.click('#SignupBtn')
      await page.waitForSelector('#SignupName')
    })
    test('it should register with name,email,password', async () => {
      await page.goto(keys[environment].links.ACCOUNTS_URL + 'signup')
      await page.waitForSelector('#SignupName')
      await page.type('#SignupName', keys[environment].test_user.name)
      await page.type('#SignupEmail', keys[environment].test_user.email)
      await page.type('#SignupPassword', keys[environment].test_user.password)
      await page.click('#SignupBtn')
      await page.waitForSelector('#SignupAppName')
    })
    test('it should take app info on Signup', async () => {
      await page.waitForSelector('#SignupAppName')
      await page.type('#SignupAppName', keys[environment].test_user.appName)
      await page.click('#SignupAppBtn')
      await page.waitForSelector('#cardName')
    })
    test('it should give error on wrong Credit Card Number', async () => {
      await page.type('#cardName', keys[environment].test_invalidUser.name)
      await page.type('#cardNumber', keys[environment].test_invalidUser.creditCard.number)
      await page.click('#cardCVV')
      const testErr = await page.$eval('#cardNumber', (e) => e.classList.contains('has-error'))
      expect(testErr).toBe(true)
    })
    test('it should work on correct payment details', async () => {
      await page.goto(keys[environment].links.ACCOUNTS_URL + 'signup')
      await page.waitForSelector('#SignupName')
      await page.type('#SignupName', keys[environment].test_user.name)
      await page.type('#SignupEmail', keys[environment].test_user.email)
      await page.type('#SignupPassword', keys[environment].test_user.password)
      await page.click('#SignupBtn')
      await page.waitForSelector('#SignupAppName')
      await page.waitForSelector('#SignupAppName')
      await page.type('#SignupAppName', keys[environment].test_user.appName)
      await page.click('#SignupAppBtn')
      await page.waitForSelector('#cardName')
      await page.type('#cardName', keys[environment].test_user.name)
      await page.type('#cardNumber', keys[environment].test_user.creditCard.number)
      await page.type('#cardCVV', keys[environment].test_user.creditCard.cvc)
      await page.select('#cardMonth', keys[environment].test_user.creditCard.expiry.month)
      await page.select('#cardYear', keys[environment].test_user.creditCard.expiry.year)
      await page.type('#city', keys[environment].test_user.city)
      await page.type('#zipCode', keys[environment].test_user.zipCode)
      await page.type('#country', 'AFG')
      await page.click('#signupCardBtn')
      await page.waitForSelector('#companyName')
    })
    test('it should accept User Details', async () => {
      await page.waitFor(5000)
      await page.type('#companyName', keys[environment].test_user.companyName)
      await page.type('#phoneNumber', keys[environment].test_user.phone)
      await page.type('#hearAbout', 'Facebook')
      await page.click('#finishSignUp')
      await page.waitForNavigation({
        timeout: 50000
      })
      expect(page.url()).toBe(keys[environment].links.DASHBOARD_URL)
    })
  })
  describe('Login', async () => {
    test('it should log out user', async () => {
      await page.waitForSelector('#userAvatar')
      await page.click('#userAvatar')
      await page.click('#logout')
      await page.waitForNavigation({
        timeout: 60000
      })
      expect(page.url()).toBe(keys[environment].links.ACCOUNTS_URL)
    })
    test('it should not login with wrong credentials', async () => {
      await page.goto(keys[environment].links.ACCOUNTS_URL, {
        waitUntil: 'networkidle2'
      })
      await page.waitForSelector('#loginEmail')
      await page.type('#loginEmail', keys[environment].test_invalidUser.email)
      await page.type('#loginPassword', keys[environment].test_invalidUser.password)
      await page.click('#loginBtn')
      await page.waitForSelector('#error')
    })
    test('it should not login if password/email is missing', async () => {
      await page.goto(keys[environment].links.ACCOUNTS_URL)
      await page.waitForSelector('#loginEmail')
      await page.type('#loginEmail', keys[environment].test_invalidUser.email)
      await page.click('#loginBtn')
      await page.waitFor(200)
      await page.waitForSelector('#loginEmail')
    })
    test('it should login with correct credentials', async () => {
      await page.goto(keys[environment].links.ACCOUNTS_URL)
      await page.waitForSelector('#loginbox')
      await page.waitForSelector('#loginEmail')
      await page.type('#loginEmail', keys[environment].test_user.email)
      await page.type('#loginPassword', keys[environment].test_user.password)
      await page.click('#loginBtn')
      await page.waitForNavigation()
      expect(page.url()).toBe(keys[environment].links.DASHBOARD_URL)
    })
  })
  // // Tests on Dashboard UI
  // /** ****** App Creation *********/
  describe('Creating App', () => {
    test('It should lead to project creation', async () => {
      await page.waitForSelector('#newApp')
      await page.click('#newApp')
      await page.waitForSelector('#createApp')
    })
    test('Payment modal should work correctly', async () => {
      await page.type('#createApp', faker.name.lastName())
      await page.click('#createAppBtn')
      await page.waitForSelector('#purchaseBtn')
      await page.click('#purchaseBtn')
      await page.waitForNavigation()
      expect(page.url()).toContain('#cbapi')
    })
  })
  // /* ********* Navigation *********/
  describe('Navigation', () => {
    test("It should navigate to selected app's settings page", async () => {
      await page.goto(keys[environment].links.DASHBOARD_URL, {
        waitUntil: 'networkidle2'
      })
      await page.waitForSelector('#manage')
      await page.click('#manage')
      await page.waitFor(500)
      expect(page.url()).toContain('settings')
    })
    test('It navigates to Tables UI', async () => {
      await page.waitForSelector('#tablesIcon')
      await page.click('#tablesIcon')
      expect(page.url()).toContain('tables')
      await page.waitForSelector('#tablesList')
      await page.click('#tablesList')
      await page.waitFor(6000)
      expect(page.url()).toContain(keys[environment].links.TABLES_URL)
    })
    test('It navigates to Files UI', async () => {
      await page.goto(keys[environment].links.DASHBOARD_URL, {
        waitUntil: 'networkidle2'
      })
      await page.waitForSelector('#manage')
      await page.click('#manage')
      await page.click('#filesIcon')
      await page.waitFor(6000)
      expect(page.url()).toContain(keys[environment].links.FILES_URL)
    })
  })
})
