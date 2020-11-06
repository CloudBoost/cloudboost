/**
 * Created by Darkstar on 11/30/2016.
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Toolbar from './toolbar/toolbar.js';
import QuickDocs from './drawer/drawer';

import { fetchApps } from '../actions';

export class App extends React.Component {
  static propTypes = {
    onLoad: PropTypes.any,
    loading: PropTypes.any,
    location: PropTypes.any,
    children: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {};
  }

    componentWillMount = () => {
      this.props.onLoad();
    }

    render () {
      if (!this.props.loading) {
        document.getElementById('initialLoader').style.display = 'none';
        return (
          <div>
            <Toolbar {...this.props} isDashboardMainPage={[window.DASHBOARD_BASE_URL, window.DASHBOARD_BASE_URL + '/admin'].indexOf(this.props.location.pathname) !== -1} />
            <QuickDocs />
            {this.props.children}
          </div>
        );
      }
      return null;
    }
}

const mapStateToProps = (state) => {
  return {
    loading: state.loader.loading,
    currentState: state.currentState || 'dashboard'
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoad: () => dispatch(fetchApps())
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(App);
