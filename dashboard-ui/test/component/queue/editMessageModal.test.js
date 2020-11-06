import React from 'react';
import {EditMessage} from '../../../app/components/queue/editMessageModal.js';

describe('<EditMessage />', () => {
  let wrapper;
  before(() => {
    const props = {
      closeEditMessageModal: sinon.spy(),
      selectedQueue: {},
      messageData: {
        message: util.makeString(),
        expires: null,
        timeout: '',
        delay: ''
      },
      showEditMessageModal: true,
    };
    wrapper = shallow(<EditMessage {...props} />, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});