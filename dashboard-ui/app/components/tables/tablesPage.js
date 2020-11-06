/**
 * Created by Darkstar on 1/4/2017.
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TableList from './tableList';

export class App extends React.Component {
  static propTypes = {
    showOthers: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.props = props;
  }

  static get contextTypes () {
    return {
      router: React.PropTypes.object.isRequired
    };
  }

  componentWillMount () {
    if (!this.props.showOthers) {
      this.context.router.push(window.DASHBOARD_BASE_URL);
    }
  }

  render () {
    return (
      <div className='panel-body table-list-container'>
        { this.props.showOthers ? <TableList /> : ''}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return { showOthers: state.manageApp.viewActive };
};

export default connect(mapStateToProps)(App);
