import React from 'react';
import {TableList} from '../../../app/components/tables/tableList.js';

describe('<TableList />', () => {
  let wrapper;
  before(() => {
    const props = {
      tables: [],
      activeAppId: util.makeString(),
      masterKey: '',
      name: util.makeString(),
      beacons: {
        firstTable: false
      },
      loading: false,
      createTable: sinon.spy(),
      setTableSearchFilter: sinon.spy(),
      updateBeacon: sinon.spy(),
      dispatch: sinon.spy()
    }
    wrapper = shallow(<TableList {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});