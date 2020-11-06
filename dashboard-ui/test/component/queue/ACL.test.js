import React from 'react';
import {ACL} from '../../../app/components/queue/ACL.js';

describe('<ACL />', () => {
  let wrapper;
  before(() => {
    const props = {
      selectedQueue: {
        ACL: {
          document: {
            read: {
              allow: {
                user: [],
                role: []
              },
              deny: {
                user: [],
                role: []
              }
            },
            write: {
              allow: {
                user: [],
                role: []
              },
              deny: {
                user: [],
                role: []
              }
            }
          }
        }
      },
      updateQueue: sinon.spy(),
      closeACLModal: sinon.spy(),
      showACLModal: true
    };
    wrapper = shallow(<ACL {...props} />, themeContext);
  });

  it('Component is rendering', () => {
    expect(wrapper).to.exist;
  });

});