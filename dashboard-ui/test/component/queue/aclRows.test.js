import React from 'react';
import ACLRows from '../../../app/components/queue/aclRows.js';

describe('<ACLRows />', () => {
  let wrapper;
  before(() => {
    const props = {
      aclList: [],
      addAcl: sinon.spy(),
      removeAcl: sinon.spy(),
      updateAclData: sinon.spy(),
    };
    wrapper = shallow(<ACLRows {...props} />, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});