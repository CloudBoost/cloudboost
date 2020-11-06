'use strict';

import React from 'react';

class Component extends React.Component {
    render() {
        return (
            <div className="dashproject app-dashproject" id="app-dashproject">
                <div className="container">
                    <div style={{color: '#549afc',marginTop:'8%',paddingLeft: '10%',paddingBottom:'10%'}}>
                    <h3 style={{fontFamily: "'Signika', 'sans-serif'",fontSize: 50}}>404</h3>
                    <h4>Sorry but the page you're looking for does not exist.</h4>
                    <div style={{marginTop:'3%'}}>
                        <a href={DASHBOARD_URL} style={{background: '#4279c6',padding: '12px 20px',borderRadius: 20,color: 'white',fontWeight: 500,marginRight:20}}>Go back to dashboard</a>
                        <a href="mailto:support@cloudboost.io" style={{background: '#4279c6',padding: '12px 20px',borderRadius: 20,color: 'white',fontWeight: 500}}>Report a problem</a>
                    </div>
                </div>
                </div>
            </div>
        )
    }
}

export default Component;
