import React from 'react';
import { Project } from '../../../app/components/dashboardproject/project';

describe('<Project />', () => {
  let wrapper;
  before(() => {
    const props = {
      _id: util.makeString(),
      loading: false,
      selectedTab: 'addDev',
      currentUser: {
        user: {
          name: util.makeString(),
          email: util.makeEmail()
        }
      },
      developers: [],
      appId: util.makeString(),
      keys: {
        master: util.generateRandomString(),
        js: util.generateRandomString(),
      },
      name: '',
      planId: 2,
      beacons: {
        tableDesignerLink: true,
      },
      invited: sinon.spy(),
      onProjectClick: sinon.spy(),
      onDeleteDev: sinon.spy(),
      fetchAppSettings: sinon.spy(),

    };
    wrapper = shallow(<Project {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});