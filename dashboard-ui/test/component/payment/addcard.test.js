import React from 'react';
import AddCard  from '../../../app/components/payment/addcard.js';

describe('<AddCard />', () => {
  let wrapper;
  before(() => {
    const props = {
      cardDetailChangeHandler: sinon.spy(),
      addCardButton: sinon.spy(),
      toggleAddcard: sinon.spy(),
      validatecardDetails: sinon.spy(),
      toggleBilling: sinon.spy(),
      getCardType: sinon.spy(),
      cardDetails: {
        number: '1111-2222-3333-4444',
        name: util.makeString(),
        displayNumber: '1111-XXXX-XXXX-4444',
        expMonth: 3,
        expYear: 20
      },
      addCardToggled: false,
      showBackBtn: true
    };
    wrapper = shallow(<AddCard {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});