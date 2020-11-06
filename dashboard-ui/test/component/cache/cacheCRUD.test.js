import React from 'react';
import { CacheCRUD } from '../../../app/components/cache/cacheCRUD.js';

describe('<CacheCRUD />', () => {
  let wrapper;
  before(() => {
    const props = {
      name: util.makeString(),
      allCache: [],
      selectedCacheItems: [],
      selectedCache: {},
      selectCache: sinon.spy(),
      addItemToCache: sinon.spy(),
      deleteItemFromCache: sinon.spy(),
      deleteCache: sinon.spy(),
      clearCache: sinon.spy()
    };
    wrapper = shallow(<CacheCRUD {...props}/>, themeContext);
  }); 

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });
  
});