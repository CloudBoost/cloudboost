export default [
  {
    id: 1,
    label: 'Free Plan',
    price: 0,
    priceDescription: 'Forever',
    hidden: true,
    priority: 1,
    usage: [
      {
        category: 'DATABASE',
        features: [
          {
            type: 'text',
            name: 'API Calls',
            limit: {
              show: true,
              label: '2,500',
              value: 2500
            }
          }, {
            type: 'text',
            name: 'Storage',
            limit: {
              show: true,
              label: '200 MB',
              value: 0.2
            }
          }
        ]
      }, {
        category: 'REALTIME',
        features: [
          {
            name: 'Connections',
            type: 'text',
            limit: {
              show: true,
              label: '500',
              value: 500
            }
          }
        ]
      }, {
        category: 'MISC',
        features: [
          {
            name: 'MongoDB Access',
            type: 'boolean',
            limit: {
              show: false,
              label: '',
              value: 0
            }
          }
        ]
      }
    ]
  },
  {
    id: 2,
    label: 'Launch Plan',
    price: 49,
    priceDescription: 'per month',
    hidden: true,
    priority: 2,
    usage: [
      {
        category: 'DATABASE',
        features: [
          {
            type: 'text',
            name: 'API Calls',
            limit: {
              show: true,
              label: '250,000',
              value: 250000
            }
          }, {
            type: 'text',
            name: 'Storage',
            limit: {
              show: true,
              label: '5 GB',
              value: 5
            }
          }
        ]
      }, {
        category: 'REALTIME',
        features: [
          {
            name: 'Connections',
            type: 'text',
            limit: {
              show: true,
              label: '500',
              value: 500
            }
          }
        ]
      }, {
        category: 'MISC',
        features: [
          {
            name: 'MongoDB Access',
            type: 'boolean',
            limit: {
              show: true,
              label: '',
              value: 1
            }
          }
        ]
      }
    ]
  },
  {
    id: 3,
    label: 'Scale Plan',
    price: '99 +',
    priceDescription: 'per month',
    hidden: true,
    priority: 3,
    usage: [
      {
        category: 'DATABASE',
        features: [
          {
            type: 'text',
            name: 'API Calls',
            limit: {
              show: true,
              label: 'Pay as you go',
              value: null
            }
          }, {
            type: 'text',
            name: 'Storage',
            limit: {
              show: true,
              label: 'Pay as you go',
              value: null
            }
          }
        ]
      }, {
        category: 'REALTIME',
        features: [
          {
            name: 'Connections',
            type: 'text',
            limit: {
              show: true,
              label: 'UNLIMITED',
              value: null
            }
          }
        ]
      }, {
        category: 'MISC',
        features: [
          {
            name: 'MongoDB Access',
            type: 'boolean',
            limit: {
              show: true,
              label: '',
              value: 1
            }
          }
        ]
      }
    ]
  },
  {
    id: 4,
    label: 'Pro Plus Monthly',
    price: '700.00',
    priceDescription: 'per month',
    hidden: false,
    priority: 8,
    usage: [
      {
        category: 'DATABASE',
        features: [
          {
            type: 'text',
            name: 'API Calls',
            limit: {
              show: true,
              label: '10,000,000',
              value: 10000000
            }
          }, {
            type: 'text',
            name: 'Storage',
            limit: {
              show: true,
              label: '100 GB',
              value: 100
            }
          }
        ]
      }, {
        category: 'REALTIME',
        features: [
          {
            name: 'Connections',
            type: 'text',
            limit: {
              show: true,
              label: '500',
              value: 500
            }
          }
        ]
      }, {
        category: 'MISC',
        features: [
          {
            name: 'MongoDB Access',
            type: 'boolean',
            limit: {
              show: true,
              label: '',
              value: 1
            }
          }
        ]
      }
    ]
  },
  {
    id: 5,
    label: 'Pro Plus Yearly',
    price: '599.00',
    priceDescription: 'per month',
    hidden: false,
    priority: 9,
    usage: [
      {
        category: 'DATABASE',
        features: [
          {
            type: 'text',
            name: 'API Calls',
            limit: {
              show: true,
              label: '10,000,000',
              value: 10000000
            }
          }, {
            type: 'text',
            name: 'Storage',
            limit: {
              show: true,
              label: '100 GB',
              value: 100
            }
          }
        ]
      }, {
        category: 'REALTIME',
        features: [
          {
            name: 'Connections',
            type: 'text',
            limit: {
              show: true,
              label: '500',
              value: 500
            }
          }
        ]
      }, {
        category: 'MISC',
        features: [
          {
            name: 'MongoDB Access',
            type: 'boolean',
            limit: {
              show: true,
              label: '',
              value: 1
            }
          }
        ]
      }
    ]
  },
  {
    id: 6,
    label: 'Pro Monthly',
    price: '292.00',
    priceDescription: 'per month',
    hidden: false,
    priority: 6,
    usage: [
      {
        category: 'DATABASE',
        features: [
          {
            type: 'text',
            name: 'API Calls',
            limit: {
              show: true,
              label: '1,000,000',
              value: 1000000
            }
          }, {
            type: 'text',
            name: 'Storage',
            limit: {
              show: true,
              label: '10 GB',
              value: 10
            }
          }
        ]
      }, {
        category: 'REALTIME',
        features: [
          {
            name: 'Connections',
            type: 'text',
            limit: {
              show: true,
              label: '500',
              value: 500
            }
          }
        ]
      }, {
        category: 'MISC',
        features: [
          {
            name: 'MongoDB Access',
            type: 'boolean',
            limit: {
              show: true,
              label: '',
              value: 1
            }
          }
        ]
      }
    ]
  },
  {
    id: 7,
    label: 'Pro Yearly',
    price: '249.00',
    priceDescription: 'per month',
    hidden: false,
    priority: 7,
    usage: [
      {
        category: 'DATABASE',
        features: [
          {
            type: 'text',
            name: 'API Calls',
            limit: {
              show: true,
              label: '1,000,000',
              value: 1000000
            }
          }, {
            type: 'text',
            name: 'Storage',
            limit: {
              show: true,
              label: '10 GB',
              value: 10
            }
          }
        ]
      }, {
        category: 'REALTIME',
        features: [
          {
            name: 'Connections',
            type: 'text',
            limit: {
              show: true,
              label: '500',
              value: 500
            }
          }
        ]
      }, {
        category: 'MISC',
        features: [
          {
            name: 'MongoDB Access',
            type: 'boolean',
            limit: {
              show: true,
              label: '',
              value: 1
            }
          }
        ]
      }
    ]
  },
  {
    id: 8,
    label: 'Basic Monthly',
    price: '93.00',
    priceDescription: 'per month',
    hidden: false,
    priority: 4,
    usage: [
      {
        category: 'DATABASE',
        features: [
          {
            type: 'text',
            name: 'API Calls',
            limit: {
              show: true,
              label: '100,000',
              value: 100000
            }
          }, {
            type: 'text',
            name: 'Storage',
            limit: {
              show: true,
              label: '1 GB',
              value: 1
            }
          }
        ]
      }, {
        category: 'REALTIME',
        features: [
          {
            name: 'Connections',
            type: 'text',
            limit: {
              show: true,
              label: '500',
              value: 500
            }
          }
        ]
      }, {
        category: 'MISC',
        features: [
          {
            name: 'MongoDB Access',
            type: 'boolean',
            limit: {
              show: true,
              label: '',
              value: 1
            }
          }
        ]
      }
    ]
  },
  {
    id: 9,
    label: 'Basic Yearly',
    price: '79.00',
    priceDescription: 'per month',
    hidden: false,
    priority: 5,
    usage: [
      {
        category: 'DATABASE',
        features: [
          {
            type: 'text',
            name: 'API Calls',
            limit: {
              show: true,
              label: '100,000',
              value: 100000
            }
          }, {
            type: 'text',
            name: 'Storage',
            limit: {
              show: true,
              label: '1 GB',
              value: 1
            }
          }
        ]
      }, {
        category: 'REALTIME',
        features: [
          {
            name: 'Connections',
            type: 'text',
            limit: {
              show: true,
              label: '500',
              value: 500
            }
          }
        ]
      }, {
        category: 'MISC',
        features: [
          {
            name: 'MongoDB Access',
            type: 'boolean',
            limit: {
              show: true,
              label: '',
              value: 1
            }
          }
        ]
      }
    ]
  },
  {
    id: -1,
    label: 'Enterprise Plan',
    price: '',
    priceDescription: 'as per custom contracts',
    hidden: true,
    priority: 10,
    usage: [
      {
        category: 'DATABASE',
        features: [
          {
            type: 'text',
            name: 'API Calls',
            limit: {
              show: true,
              label: 'UNLIMITED',
              value: null
            }
          }, {
            type: 'text',
            name: 'Storage',
            limit: {
              show: true,
              label: 'UNLIMITED',
              value: null
            }
          }
        ]
      }, {
        category: 'REALTIME',
        features: [
          {
            name: 'Connections',
            type: 'text',
            limit: {
              show: true,
              label: 'UNLIMITED',
              value: null
            }
          }
        ]
      }, {
        category: 'MISC',
        features: [
          {
            name: 'MongoDB Access',
            type: 'boolean',
            limit: {
              show: true,
              label: '',
              value: 1
            }
          }
        ]
      }
    ]
  }
];
