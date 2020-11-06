import React from 'react';
import { TableContainer } from '../../../app/components/tables/tableContainer.js';

describe('<TableContainer />', () => {
  let wrapper;
  before(() => {
    const props = {
      tables: [],
      activeAppId: util.makeString(),
      masterKey: '',
      loading: false,
      deleteTable: sinon.spy(),
      onLoad: sinon.spy()
    };
    wrapper = shallow(<TableContainer {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});