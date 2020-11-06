import React from 'react';
import ChangeField from '../../../app/components/profile/ChangeField.js';

describe('<ChangeField />', () => {
  let wrapper;
  before(() => {
    const props = {
      field: 'password',
      value: '',
      changeHandler: sinon.spy(),
      keyUpHandler: sinon.spy()
    };
    wrapper = shallow(<ChangeField {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});