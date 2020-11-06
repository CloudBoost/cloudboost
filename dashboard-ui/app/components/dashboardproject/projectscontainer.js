'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Project from './project.js';
import {
  manageApp,
  exitApp,
  updateBeacon,
  fetchAppSettings,
  upsertAppSettingsFile,
  showAlert
} from '../../actions';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-bootstrap';

const styles = {
  root: {
    display: 'flex',
    justifyContent: 'space-around'
  },
  refresh: {
    display: 'inline-block',
    position: 'relative',
    background: 'none',
    boxShadow: 'none',
    marginTop: '-6px',
    float: 'right'
  }
};

export class Projectscontainer extends React.Component {
  static propTypes = {
    dispatch: PropTypes.any,
    currentUser: PropTypes.any,
    apps: PropTypes.any,
    beacons: PropTypes.any,
    generalSettings: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      value: '',
      appSettingObj: {
        appIcon: null,
        appInProduction: false,
        appName: null
      }
    };
  }
  changeHandler = (e) => {
    this.setState({ value: e.target.value });
  }
  onDeleteDev = (appId) => {
    this.props.dispatch(exitApp(appId, this.props.currentUser.user._id));
  }
  onProjectClick = (appId, masterKey, jsKey, name, from) => {
    this.props.dispatch(updateBeacon(this.props.beacons, 'tableDesignerLink'));
    this.props.dispatch(manageApp(appId, masterKey, jsKey, name, from));
  }
  fetchAppSettings = (appId, masterKey, file) => {
    if (file.type.includes('image')) {
      this.props.dispatch({ type: 'START_LOADING' });
      this.props.dispatch(fetchAppSettings(appId, masterKey, '/')).then(() => {
        if (this.props.generalSettings) {
          this.props.dispatch(upsertAppSettingsFile(appId, masterKey, file, 'general', {
            ...this.state
          }));
        }
      });
    } else {
      showAlert('error', 'Only images are allowed.');
    }
  }
  render () {
    const content = this.props.apps.length
      // ? this.props.apps.map(app => <Col xs={8} sm={6} md={4} lg={3} key={app._id} className='project-grid'>
      ? this.props.apps.map(app => <Col key={app._id} className='project-grid'>
        <Project onProjectClick={this.onProjectClick}
          key={app._id}
          fetchAppSettings={this.fetchAppSettings}
          {...app}
          currentUser={this.props.currentUser}
          onDeleteDev={this.onDeleteDev}
          beacons={this.props.beacons}
          selectedPlan={app.planId} />
      </Col>)
      : '';

    return (
      <div style={styles.root}>
        <Grid fluid className='projects-container'>
          <Row className='show-grid'>
            {content}
          </Row>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let generalSettings = null;
  if (state.settings.length) {
    generalSettings = state.settings.filter(x => x.category === 'general')[0];
  }
  return {
    apps: state.apps || [],
    currentUser: state.user,
    loading: state.loader,
    beacons: state.beacons,
    generalSettings: generalSettings
  };
};

export default connect(mapStateToProps, null)(Projectscontainer);
