import React from 'react';
import { APIAnalytics } from '../../../app/components/analytics/apiAnalytics.js';

describe('<APIAnalytics />', () => {
  let wrapper;
  before(() => {
    const props = {
      analyticsApi: {}
    };

    wrapper = shallow(<APIAnalytics {...props}/>, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
});