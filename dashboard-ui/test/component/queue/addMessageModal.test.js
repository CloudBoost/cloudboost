import React from 'react';
import {AddMessage} from '../../../app/components/queue/addMessageModal.js';

describe('<AddMessage />', () => {
  let wrapper;
  before(() => {
    const props = {
      addItemToQueue: sinon.spy(),
      selectedQueue: {},
      removeAcl: sinon.spy(),
      updateAclData: sinon.spy(),
    };
    wrapper = shallow(<AddMessage {...props} />, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});