/**
 * Created by Darkstar on 11/30/2016.
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { manageApp, changeState } from '../actions';
const ReactRouter = require('react-router');
const browserHistory = ReactRouter.browserHistory;

export class AppSelected extends React.Component {
  static propTypes = {
    apps: PropTypes.any,
    isAppActive: PropTypes.any,
    params: PropTypes.any,
    routes: PropTypes.any,
    dispatch: PropTypes.any,
    openDrawer: PropTypes.any,
    children: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      selected: 'settings',
      isAppDisabled: false
    };
  }

  static get contextTypes () {
    return { router: React.PropTypes.object.isRequired };
  }

  componentWillMount () {
    // if no app data is found in memory , then find the app and set that data
    if (this.props.isAppActive === false) {
      let appFound = false;
      this.props.apps.map((app) => {
        if (app.appId === this.props.params.appId) {
          appFound = true;
          this.setState({
            isAppDisabled: app.disabled
          });
          // save app data in memory
          this.props.dispatch(manageApp(app.appId, app.keys.master, app.keys.js, app.name));
        }
      });

      // if app not found , send back to home page
      if (!appFound) { browserHistory.push(window.DASHBOARD_BASE_URL); }
    }
  }

  componentWillReceiveProps (props) {
    // select nav button wrt to path
    if (props.routes[2].path) {
      this.setState({ selected: props.routes[2].path });
    }
  }

  redirectTo = (where) => () => {
    this.context.router.push('/' + this.props.params.appId + '/' + where);
    this.props.dispatch(changeState(where, this.props.openDrawer));
  }

  openFiles = () => {
    let url = window.DASHBOARD_BASE_URL + '/' + this.props.params.appId + '/files';
    var win = window.open(url, '_self');
    win.focus();
  }

  openAnalytics = () => {
    let url = window.ANALYTICS_URL + '/' + this.props.params.appId;
    var win = window.open(url, '_blank');
    win.focus();
  }

  render () {
    return (
      <div className='push-campaign'>
        <div className='panel menu-panel'>
          <div className='menu-wrapper'>
            <div className='panel-menu'>
              <ul>
                <li style={this.state.isAppDisabled ? { cursor: 'not-allowed' } : null}
                  className={this.state.selected === 'tables' ? 'active' : ''}
                  onClick={!this.state.isAppDisabled && this.redirectTo('tables')}>
                  <i className='fa fa-bars' id='tablesIcon' aria-hidden='true' /> &nbsp;Tables
                </li>

                <li style={this.state.isAppDisabled ? { cursor: 'not-allowed' } : null}
                  className={this.state.selected === 'files' ? 'active' : ''}
                  onClick={!this.state.isAppDisabled && this.redirectTo('files')}>
                  <i className='fa fa-file' id='filesIcon' aria-hidden='true' /> &nbsp;Files
                </li>

                {/* <li className={this.state.selected === "push" ? "active" : ""}
                                    onClick={this.redirectTo.bind(this, 'push')}>
                                    <i className="fa fa-bell-o " /> &nbsp;Push Notifications
                                </li>

                                <li className={this.state.selected === "email" ? "active" : ""}
                                    onClick={this.redirectTo.bind(this, 'email')}>
                                    <i className="fa fa-envelope-o" /> &nbsp;Email Campaign
                                </li> */}

                <li className={this.state.selected === 'settings' ? 'active' : ''}
                  onClick={this.redirectTo('settings')}>
                  <i className='fa fa-cog ' id='settingsIcon' /> &nbsp;Settings
                </li>

                {/* <li className={this.state.selected === "queue" ? "active" : ""}
                                    onClick={this.redirectTo.bind(this, 'queue')}>
                                    <i className="fa fa-exchange" /> &nbsp;Queue
                                </li>

                                <li className={this.state.selected === "cache" ? "active " : ""}
                                    onClick={this.redirectTo.bind(this, 'cache')}>
                                    <i className="fa fa-bolt" /> &nbsp;Cache
                                </li>

                                <li className={this.state.selected === "analytics" ? "active" : ""}
                                    onClick={this.redirectTo.bind(this, 'analytics')}>
                                    <i className="fa fa-bar-chart " /> &nbsp;Usage
                                </li>
                                <li className={this.state.selected === "appAnalytics" ? "active" : ""}
                                    onClick={this.openAnalytics.bind(this)}>
                                    <i className="fa fa-bar-chart "/> &nbsp;App Analytics
                                </li> */}
              </ul>
            </div>
            <div className='panel-content'>
              {this.props.isAppActive && this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let isAppActive = state.manageApp.viewActive || false;
  return {
    apps: state.apps || [],
    isAppActive,
    openDrawer: state.drawer.openDrawer
  };
};

export default connect(mapStateToProps, null)(AppSelected);
