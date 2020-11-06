import React from 'react';
import {UserAccess} from '../../../app/components/dashboardproject/userAccess.js';

describe('<UserAccess />', () => {
  let wrapper;
  before(() => {
    const props = {
      developerList: [], 
      devIdArray: [], 
      currentUser: {
        user: {
          _id: util.makeString(),
          name: util.makeString(),
          email: util.makeEmail()
        }
      }, 
      loading: {
        modal_loading: false
      },
      invited: [],
      appId: util.makeString(),
      invite: sinon.spy(),
      fetchDevDetails: sinon.spy(),
      onDeleteDev: sinon.spy(),
      onDeleteInvite: sinon.spy(),
      changeDeveloperRole: sinon.spy(),
      fetchApps: sinon.spy()
    };
    wrapper = shallow(<UserAccess {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});