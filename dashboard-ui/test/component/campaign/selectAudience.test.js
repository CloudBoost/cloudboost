import React from 'react';
import { SelectAudience } from '../../../app/components/campaign/selectAudience.js';

describe('<SelectAudience />', () => {
  let wrapper;
  before(() => {
    const props = {
      buildQuery: sinon.spy()
    };
    wrapper = shallow(<SelectAudience {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});