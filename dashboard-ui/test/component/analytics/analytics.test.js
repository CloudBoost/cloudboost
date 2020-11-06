import React from 'react';
import { Analytics } from '../../../app/components/analytics/analytics.js';

describe('<Analytics />', () => {
  let wrapper;
  before(() => {
    const props = {
      appData: {
        viewActive: true
      }, 
      analyticsApi: {}, 
      analyticsStorage: {},
      fetchAnalyticsAPI: sinon.spy(),
      fetchAnalyticsStorage: sinon.spy(),
      resetAnalytics: sinon.spy()
    };

    wrapper = shallow(<Analytics {...props}/>, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});