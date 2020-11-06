import React from 'react';
import { Admin } from '../../../app/components/admin/admin.js';

describe('<Admin />', () => {
  let wrapper;
  before(() => {
    const props = {
      currentUser: {},
      loading: false,
      userList: [{
        email: util.makeEmail(),
        name: util.makeString(),
        emailVerified: true,
        isAdmin: true,
        isActive: true,
      }],
      isAdmin: true,
      getUsersBySkipLimit: sinon.spy(),
      updateUserActive: sinon.spy(),
      updateUserRole: sinon.spy(),
      deleteUser: () => {},
      addUser: sinon.spy(),
      upsertAPI_URL: () => {}
    };

    wrapper = mount(<Admin {...props}/>, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

  // it('should dispatch actions', () => {
  //   expect(wrapper.props().getUsersBySkipLimit.calledOnce).to.be.false;
  // });

});