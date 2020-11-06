import React from 'react';
import { App } from '../../../app/components/tables/tablesPage.js';

describe('<App />', () => {
  let wrapper;
  before(() => {
    const props = {
      showOthers: true
    };
    wrapper = shallow(<App {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});