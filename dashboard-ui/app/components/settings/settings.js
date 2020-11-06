/**
 * Created by Darkstar on 11/29/2016.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchAppSettings, resetAppSettings } from '../../actions';

// sub comps
import General from './general';
import Email from './email';
// import Push from './push';
import ImportExport from './import';
// import MongoAccess from './mongo';
import Integrations from './integrations';

import Invoice from './invoices';

export class Settings extends React.Component {
  static propTypes = {
    onLoad: PropTypes.any,
    settingsLoaded: PropTypes.any,
    appData: PropTypes.any,
    resetAppSettings: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      selected: 'General',
      renderComponent: false,
      open: true
    };
  }

  static get contextTypes () {
    return { router: React.PropTypes.object.isRequired };
  }

  componentWillMount () {
    // load settings if not already found
    if (!this.props.settingsLoaded) {
      this.props.onLoad(this.props.appData.appId, this.props.appData.masterKey);
    }
  }

  componentWillUnmount () {
    this.props.resetAppSettings();
  }

  handleActive (tab) {
    this.setState({ selected: tab, renderComponent: true });
    this.renderCurrentSelection();
  }
    renderCurrentSelection = () => {
      switch (this.state.selected) {
        case 'General':
          return <General {...this.props} />;
        case 'Email':
          return <Email />;
        case 'Cash':
          return <Invoice />;
        case 'ImportExport':
          return <ImportExport />;
        case 'Integrations':
          return <Integrations renderComponent />;
        default:
          return <General {...this.props} />;
      }
    }

    render () {
      return (
        <div>
          <div className='menu-wrapper'>
            <div className='divider' />
            <div className='settingsNavbar'>
              <ul>
                <li className={this.state.selected === 'General' ? 'active' : ''} onClick={() => this.handleActive('General')}><i className='ion ion-android-settings tabicon' /><p> General</p></li>
                <li className={this.state.selected === 'Email' ? 'active' : ''} onClick={() => this.handleActive('Email')}><i className='ion ion-email tabicon' /><p> Email</p></li>
                <li className={this.state.selected === 'Cash' ? 'active' : ''} onClick={() => this.handleActive('Cash')}><i className='ion ion-cash tabicon' /><p> Invoices</p></li>
                <li className={this.state.selected === 'ImportExport' ? 'active' : ''} onClick={() => this.handleActive('ImportExport')}><i className='ion ion-arrow-swap tabicon' /><p> Imports/Exports</p></li>
                <li className={this.state.selected === 'Integrations' ? 'active' : ''} onClick={() => this.handleActive('Integrations')}><i className='fa fa-puzzle-piece tabicon' /><p> Integrations</p></li>
              </ul>
            </div>
          </div>
          <div className='panel-body'
            style={{
              backgroundColor: '#FFF',
              paddingTop: 0
            }}>
            <div className='settingsCurrent'>
              {this.renderCurrentSelection()}
            </div>
          </div>
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
    appData: state.manageApp,
    loading: state.loader.secondary_loading,
    settingsLoaded: state.settings.length,
    generalSettings
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoad: (appId, masterKey) => dispatch(fetchAppSettings(appId, masterKey)),
    resetAppSettings: () => dispatch(resetAppSettings())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
