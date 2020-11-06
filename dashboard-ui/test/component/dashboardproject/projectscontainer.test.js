import React from 'react';
import { Projectscontainer } from '../../../app/components/dashboardproject/projectscontainer';

describe('<Projectscontainer />', () => {
  let wrapper;
  before(() => {
    const props = {
      apps: [],
      loading: {
        modal_loading: false
      },
      currentUser: {
        user: {
          _id: util.makeString()
        }
      },
      beacons: {
        firstApp: true
      },
      generalSettings: true,
      dispatch: sinon.spy()
    };
    wrapper = shallow(<Projectscontainer {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});