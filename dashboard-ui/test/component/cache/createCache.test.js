import React from 'react';
import { CreateCache } from '../../../app/components/cache/createCache.js';

describe('<CreateCache />', () => {
  let wrapper;
  before(() => {
    const props = {
      loading: false,
      children: ''
    };
    wrapper = shallow(<CreateCache {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});