import React from 'react';
import FirstDisplay from '../../../app/components/cache/firstDisplay.js';

describe('<FirstDisplay />', () => {
  let wrapper;
  before(() => {
    wrapper = shallow(<FirstDisplay/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});