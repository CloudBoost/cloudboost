'use strict';

import React from 'react';
import Projecthead from './projecthead';
import Projectscontainer from './projectscontainer';
import Footer from '../footer/footer';

const Dashboardproject = React.createClass({
  render: function () {
    return (
      <div>
        <div className='dashproject app-dashproject' id='app-dashproject'>
          <div>
            <Projecthead />
            <Projectscontainer />
          </div>
        </div>
        <Footer id='app-footer' />
      </div>
    );
  }
});

export default Dashboardproject;
