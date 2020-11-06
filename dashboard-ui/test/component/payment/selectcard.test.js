import React from 'react';
import SelectCard from '../../../app/components/payment/selectcard.js';

describe('<SelectCard />', () => {
  let wrapper;
  before(() => {
    const props = {
      selectCard: sinon.spy(),
      getCardType: sinon.spy(),
      selectedCard: {
        cardId: util.makeString()
      },
      purchase: sinon.spy(),
      toggleAddcard: sinon.spy(),
      deleteCard: sinon.spy(),
      planId: util.makeString(),
      selectedPlan: {
        id: util.makeString()
      },
      addCardToggled: true,
      billingToggled: true,
      cards: [{
        cardId: util.makeString(),
        number: '1111-2222-3333-4444',
        
      }]
    };
    wrapper = shallow(<SelectCard {...props} />, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});