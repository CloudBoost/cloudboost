import React from 'react';
import {MongoAccess} from '../../../app/components/settings/mongo.js';

describe('<MongoAccess />', () => {
  let wrapper;
  before(() => {
    const props = {
      appData: {
        appId: util.makeString(),
        masterKey: util.generateRandomString()
      },
    };
    wrapper = shallow(<MongoAccess {...props} />, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});