import React from 'react';
import { ProjectName } from '../../../app/components/dashboardproject/projectname.js';

describe('<ProjectName />', () => {
  let wrapper;
  before(() => {
    const props = {
      name: util.makeString(),
      onProjectClick: sinon.spy(),
      onNameChange: sinon.spy(),
      appId: util.makeString()
    };
    wrapper = shallow(<ProjectName {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});