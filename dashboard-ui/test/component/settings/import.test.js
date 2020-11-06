import React from 'react';
import {ImportExport} from '../../../app/components/settings/import.js';

describe('<ImportExport />', () => {
  let wrapper;
  before(() => {
    const props = {
      appData: {
        appId: util.makeString(),
        masterKey: util.generateRandomString()
      },
      importDatabase: sinon.spy(),
      exportDatabase: sinon.spy()
    };
    wrapper = shallow(<ImportExport {...props} />, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});