import React from 'react';
import { Profile } from '../../../app/components/profile/profile.js';

describe('<Profile />', () => {
  let wrapper;
  before(() => {
    const props = {
      currentUser: {
        user: {
          name: util.makeString(),
          email: util.makeEmail()
        },
        file: {
          document: {
            id: util.makeString(),
            url: util.generateRandomString()
          }
        }
      },
      loading: false,
      open: true,
      close: sinon.spy(),
      saveUserImage: sinon.spy(),
      deleteUserImage: sinon.spy(),
    };
    wrapper = shallow(<Profile {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});