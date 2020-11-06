import React from 'react';
import Billing  from '../../../app/components/payment/billing.js';

describe('<Billing />', () => {
  let wrapper;
  before(() => {
    const props = {
      billingChangeHandler: sinon.spy(),
      toggleBilling: sinon.spy(),
      addCardButton: sinon.spy(),
      selectedPlan: sinon.spy(),
      planId: util.makeString(),
      billingToggled: false,
      cardDetails: {
        addrLine1: util.makeString(),
        addrLine2: util.makeString(),
        city: util.makeString(),
        state: util.makeString(),
        zipCode: util.makeString(),
        country: 'India'
      },
    };
    wrapper = shallow(<Billing {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});