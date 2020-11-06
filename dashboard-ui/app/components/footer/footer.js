'use strict';

import React from 'react';
import Footerlist from './footerlist';

const Footer = React.createClass({
  render: function () {
    return (
      <div className='footer navbar-fixed-bottom'>
        <div className='container'>
          <Footerlist />
        </div>
      </div>
    );
  }
});

export default Footer;
