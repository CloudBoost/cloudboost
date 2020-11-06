import React from 'react';
import { StorageAnalytics } from '../../../app/components/analytics/storageAnalytics.js';

describe('<StorageAnalytics />', () => {
  let wrapper;
  before(() => {
    const props = {
      analyticsStorage: {}
    };
    wrapper = shallow(<StorageAnalytics {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});