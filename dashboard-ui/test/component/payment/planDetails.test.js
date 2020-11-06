import React from 'react';
import PlanDetails from '../../../app/components/payment/planDetails.js';

describe('<PlanDetails />', () => {
  let wrapper;
  before(() => {
    const props = {
      selectPlan: sinon.spy(),
      selectedPlan: {
        id: 1,
        label: "Free Plan",
        price: 0,
        priceDescription: "FOREVER",
        usage: [
          {
            category: "DATABASE",
            features: [
              {
                type: "text",
                name: "API Calls",
                limit: {
                  show: true,
                  label: "5,000",
                  value: 5000
                }
              }, {
                type: "text",
                name: "Storage",
                limit: {
                  show: true,
                  label: "200 MB",
                  value: 0.2
                }
              }
            ]
          }, {
            category: "REALTIME",
            features: [
              {
                name: "Connections",
                type: "text",
                limit: {
                  show: true,
                  label: "500",
                  value: 500
                }
              }
            ]
          }, {
            category: "MISC",
            features: [
              {
                name: "MongoDB Access",
                type: "boolean",
                limit: {
                  show: false,
                  label: "",
                  value: 0
                }
              }
            ]
          }
        ]
      }
    };
    wrapper = shallow(<PlanDetails {...props} />, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});