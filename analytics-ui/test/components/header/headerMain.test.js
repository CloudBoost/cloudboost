import React from 'react';
import HeaderMain from '../../../dev/js/components/header/headerMain.js';

describe('<HeaderMain />', () => {
  let wrapper;
  before(() => {
    const props = {
      currentApp: util.generateRandomString(),
    };

    wrapper = shallow(<HeaderMain {...props}/>, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});