import React from 'react';
import { Cache } from '../../../app/components/cache/cache.js';

describe('<Cache />', () => {
  let wrapper;
  before(() => {
    const props = {
      appData: {
        viewActive: true
      }, 
      allCache: {}, 
      noCacheFound: true,
      loaded: true,
      onLoad: sinon.spy(),
      resetCacheState: sinon.spy()
    };
    wrapper = shallow(<Cache {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});