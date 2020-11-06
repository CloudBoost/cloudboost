import React from 'react';
import {Queue} from '../../../app/components/queue/queue.js';

describe('<Queue />', () => {
  let wrapper;
  before(() => {
    const props = {
      appData: {
        viewActive: true
      },
      onLoad: sinon.spy(),
      resetQueueState: sinon.spy(),
      loaded: true,
      noQueueFound: false
    };
    wrapper = shallow(<Queue {...props} />, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});