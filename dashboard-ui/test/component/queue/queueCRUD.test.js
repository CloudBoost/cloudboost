import React from 'react';
import {QueueCRUD} from '../../../app/components/queue/queueCRUD.js';

describe('<QueueCRUD />', () => {
  let wrapper;
  before(() => {
    const props = {
      deleteQueue: sinon.spy(),
      deleteItemFromQueue: sinon.spy(),
      selectedQueue: {
        name: util.makeString()
      },
      allQueues: [],
      selectQueue: sinon.spy(),
      name: util.makeString(),
      selectedQueueItems: [{
        message: util.makeString(),
        expires: null,
        timeout: '',
        delay: ''
      }]
    };
    wrapper = shallow(<QueueCRUD {...props} />, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});