import React from 'react';
import FirstDisplay from '../../../app/components/queue/firstDisplay.js';

describe('<FirstDisplay />', () => {
  let wrapper;
  before(() => {
    const props = {
      
    };
    wrapper = shallow(<FirstDisplay {...props} />, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});