import React from 'react';
import {CreateQueue} from '../../../app/components/queue/createQueue.js';

describe('<CreateQueue />', () => {
  let wrapper;
  before(() => {
    const props = {
      loading: true,
      dispatch: sinon.spy(),
      children: '',

    };
    wrapper = shallow(<CreateQueue {...props} />, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});