import React from 'react';
import { App } from '../../app/components/app.js';

describe('<App />', () => {
  let wrapper;
  before(() => {
    const props = {
      loading: false,
      onLoad: sinon.spy(),
      children: '',
      location: {
        pathname: '/'
      }
    };
    wrapper = shallow(<App {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});