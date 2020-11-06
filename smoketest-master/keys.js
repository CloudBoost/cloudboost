import faker from 'faker'

module.exports = {
  staging: {
    test_user: {
      name: faker.name.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      phone: faker.phone.phoneNumber(),
      creditCard: {
        number: '4242424242424242',
        cvc: '125',
        expiry: {
          month: '10',
          year: '2021'
        }
      },
      city: faker.address.city(),
      zipCode: '71000',
      appName: 'Test',
      companyName: 'Hackerbay'
    },
    test_invalidUser: {
      name: faker.name.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      creditCard: {
        number: '4242424242484143',
        cvc: '125',
        expiry: {
          month: '10',
          year: '2021'
        }
      }
    },
    links: {
      DASHBOARD_URL: 'https://staging-dashboard.cloudboost.io/',
      ACCOUNTS_URL: 'https://staging-accounts.cloudboost.io/',
      FILES_URL: 'https://staging-files.cloudboost.io/',
      TABLES_URL: 'https://staging-tables.cloudboost.io/'
    }
  },
  local: {
    test_user: {
      name: faker.name.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      phone: faker.phone.phoneNumber(),
      creditCard: {
        number: '4242424242424242',
        cvc: '125',
        expiry: {
          month: '10',
          year: '2022'
        }
      },
      city: faker.address.city(),
      zipCode: '71000',
      appName: 'Test',
      companyName: 'Hackerbay'
    },
    test_invalidUser: {
      name: faker.name.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      creditCard: {
        number: '4242424242484143',
        cvc: '125',
        expiry: {
          month: '10',
          year: '2021'
        }
      }
    },
    links: {
      DASHBOARD_URL: 'http://localhost:1440/',
      ACCOUNTS_URL: 'http://localhost:1447/',
      FILES_URL: 'http://localhost:3012/',
      TABLES_URL: 'http://localhost:3333/'
    }
  },
  production: {
    test_user: {
      email: 'foundation@cloudboost.io',
      password: 'sample'
    },
    test_invalidUser: {
      name: faker.name.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      creditCard: {
        number: '4242424242484143',
        cvc: '125',
        expiry: {
          month: '10',
          year: '2021'
        }
      }
    },
    links: {
      DASHBOARD_URL: 'https://dashboard.cloudboost.io/',
      ACCOUNTS_URL: 'https://accounts.cloudboost.io/',
      FILES_URL: 'https://files.cloudboost.io/',
      TABLES_URL: 'https://tables.cloudboost.io/'
    }
  }
}
