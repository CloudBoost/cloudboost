'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ProjectName from './projectname.js';
import Progressbar from './progressbar.js';
import Dropzone from 'react-dropzone';

import { toggleDrawer, cancelPlan } from '../../actions';

import IconDelete from 'material-ui/svg-icons/action/delete';
import FileFileUpload from 'material-ui/svg-icons/file/file-upload';
import Key from 'material-ui/svg-icons/communication/vpn-key';
import PersonAdd from 'material-ui/svg-icons/social/person-add';
import ManageApp from 'material-ui/svg-icons/navigation/apps';
import { grey500, grey300 } from 'material-ui/styles/colors';
import ReactTooltip from 'react-tooltip';
import DeleteApp from './deleteApp';
import CancelPlan from '../payment/cancelplan';
import ExitApp from './exitApp';
import Exit from 'material-ui/svg-icons/action/exit-to-app';
import AddDeveloper from './addDeveloper';
import ManageKeys from './manageKeys';
import UpgradePlan from '../payment/upgradeplan';
import planList from '../../fakeAPI/plans';

const iconStyles = {
  marginRight: 12,
  marginLeft: 12
};

const styles = {
  beacon: {
    marginTop: -33
  }
};

export class Project extends React.Component {
  static propTypes = {
    selectedTab: PropTypes.any,
    planExceeded: PropTypes.bool,
    currentUser: PropTypes.shape({
      user: PropTypes.object
    }),
    developers: PropTypes.array,
    fetchAppSettings: PropTypes.func,
    appId: PropTypes.string,
    keys: PropTypes.shape({
      master: PropTypes.string,
      js: PropTypes.string
    }),
    name: PropTypes.string,
    onProjectClick: PropTypes.func,
    onCancel: PropTypes.func,
    planId: PropTypes.number,
    numMaxAPI: PropTypes.any,
    numMaxStorage: PropTypes.any,
    disabled: PropTypes.bool,
    storageUsed: PropTypes.any,
    loading: PropTypes.any,
    apps: PropTypes.array,
    beacons: PropTypes.any,
    apiUsed: PropTypes.any,
    onDeleteDev: PropTypes.func,
    generalSettings: PropTypes.any,
    dispatch: PropTypes.func,
    invited: PropTypes.any,
    _id: PropTypes.any
  }

  constructor (props) {
    super(props);
    this.state = {
      showModal: false,
      showDeleteModal: false,
      showUpgradeModal: false,
      deleteButtonState: true,
      showExitModal: false,
      showDeveloperModal: false,
      showKeysModal: false,
      showCancelModal: false,
      cancelButtonState: false,
      selectedTab: (typeof this.props.selectedTab !== 'undefined')
        ? this.props.selectedTab
        : 'addDev'
    };
  }

  handleSelect = (selectedKey) => {
    alert('selected ' + selectedKey); // eslint-disable-line no-undef
  }

  close = () => {
    this.setState({ showModal: false });
  }

  closeDeleteModal = () => {
    this.setState({ showDeleteModal: false });
  }

  closeCancelModal = (closeUpgrade) => {
    this.setState({ showCancelModal: false });
    if (closeUpgrade) {
      this.closeUpgradeModal();
    }
  }

  closeUpgradeModal = () => {
    this.setState({ showUpgradeModal: false });
  }

  closeExitModal = () => {
    this.setState({ showExitModal: false });
  }

  closeDeveloperModal = () => {
    this.setState({ showDeveloperModal: false });
  }

  closeKeyModal = () => {
    this.setState({ showKeysModal: false });
  }

  open1 = () => {
    if (!this.props.planExceeded) this.setState({ showDeveloperModal: true });
  }

  open2 = () => {
    if (!this.props.planExceeded) this.setState({ showKeysModal: true });
  }

  open3 = () => {
    this.setState({ showUpgradeModal: true });
  }

  delete = () => {
    this.setState({ showDeleteModal: true });
  }

  showCancel = (cancelOption) => {
    this.setState({ showCancelModal: true, cancelOption });
  }

  isAppAdmin = () => {
    if (this.props.currentUser.user) {
      return this.props.developers.filter((x) => x.userId === this.props.currentUser.user._id && x.role === 'Admin').length;
    } else { return false; }
  }

handleChange = (value) => (e) => {
  if (e.target.value === value) {
    this.setState({ deleteButtonState: false });
  }
}

exitApp = () => {
  this.setState({ showExitModal: true });
}

onDrop = (acceptedFiles) => {
  this.props.fetchAppSettings(this.props.appId, this.props.keys.master, acceptedFiles[0]);
}

setImgFallbackUrl = (e) => {
  e.target.onError = null;
  e.target.src = 'public/assets/images/default-app-icon.png';
}

onProjectClick = () => {
  if (!this.props.planExceeded) { this.props.onProjectClick(this.props.appId, this.props.keys.master, this.props.keys.js, this.props.name, '/'); }
}

handleCancelClick = () => {
  const { appId, onCancel } = this.props;
  const { cancelOption } = this.state;
  return onCancel(appId, cancelOption);
}

menuProject = () => {
  let planExceeded = this.props.planExceeded;
  return this.isAppAdmin() ? <div style={{ display: 'inline' }}>
    <PersonAdd style={iconStyles}
      data-tip='Manage Developers'
      color={planExceeded ? grey300 : grey500}
      onClick={this.open1} />

    <Key style={iconStyles}
      data-tip='Manage Keys'
      color={planExceeded ? grey300 : grey500}
      onClick={this.open2} />
    {
      (this.props.planId !== -1) &&
        <FileFileUpload style={iconStyles}
          data-tip='Upgrade Plan'
          color={grey500}
          onClick={this.open3} />
    }
    {
      this.props.numMaxAPI !== null && this.props.numMaxStorage !== null && (this.props.apiUsed >= 80 || this.props.storageUsed >= 80) &&
        <span className='gps_ring upgrade_plan_beacon' />
    }
    <IconDelete style={iconStyles} data-tip='Delete App' color={grey500}
      onClick={this.delete} />
  </div>
    : <div style={{ display: 'inline' }}>
      {/* call deletedev for exit */}
      <Exit style={iconStyles} data-tip='Remove Yourself' color={grey500}
        onClick={this.exitApp} />

      <Key style={iconStyles}
        data-tip='Manage Keys'
        color={planExceeded ? grey300 : grey500}
        onClick={this.open2} />
      {
        (this.props.planId !== -1) &&
        <FileFileUpload style={iconStyles} data-tip='Upgrade Plan' color={grey300} />
      }
      <IconDelete style={iconStyles} data-tip='Delete App' color={grey300} />
    </div>;
}

render = () => {
  let planName;
  let plan = planList.filter(function (currPlan) {
    return currPlan.id === this.props.planId;
  }.bind(this));

  plan = plan[0] || planList[0];
  planName = plan.label;

  let planExceeded = this.props.planExceeded;
  const computedText = this.props.disabled ? 'BLOCKED' : planName;
  return (
    <div className='project' ref='project'>
      {
        this.isAppAdmin()
          ? <div className='plan-status' onClick={(this.props.planId !== -1) && !this.props.disabled ? this.open3 : null}>{computedText}</div>
          : <div className='plan-status-disabled'>{computedText}</div>
      }
      <div className='app-info'>
        <Dropzone accept='image/*' onDrop={this.onDrop} className='dropBody'>
          <div className='app-icon' style={{
            /* eslint-disable-next-line no-undef */
            background: 'url(' + SERVER_URL + '/appfile/' + this.props.appId + '/icon' + ') , url(public/assets/images/default-app-icon.jpg)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center'
          }}>
            <div className='app-icon-overlay '>
              <i className='ion ion-edit overlay-icon' />
            </div>
            {/* <img height="20px" className="app-selector-img" src={SERVER_URL + '/appfile/' + this.props.appId + '/icon'} onError={this.setImgFallbackUrl}></img> */}
          </div>
        </Dropzone>
        <ProjectName name={this.props.name} appId={this.props.appId} planExceeded={planExceeded} />
        <Progressbar onProjectClick={this.onProjectClick} {...this.props} />
      </div>
      <div className='project-option'>
        <span className={this.props.beacons.tableDesignerLink ? 'hide' : 'joyride-beacon manage_app_beacon'}
          onClick={this.onProjectClick}>
          <span className='joyride-beacon__inner' />
          <span className='joyride-beacon__outer' />
        </span>
        <div style={this.props.beacons.tableDesignerLink ? {} : styles.beacon}>

          {
            !this.props.disabled && <ManageApp style={iconStyles}
              color={planExceeded ? grey300 : grey500}
              data-tip='Manage'
              id='manage'
              onClick={this.onProjectClick}
            />
          }
          {
            this.props.disabled && this.isAppAdmin()
              ? <div style={{ display: 'inline' }}>
                <FileFileUpload style={iconStyles}
                  data-tip='Upgrade Plan'
                  color={grey500}
                  onClick={this.open3} />
              </div> : null
          }
          { !this.props.disabled && this.isAppAdmin()
            ? <div style={{ display: 'inline' }}>
              <PersonAdd style={iconStyles}
                data-tip='Manage Developers'
                color={planExceeded ? grey300 : grey500}
                onClick={this.open1} />

              <Key style={iconStyles}
                data-tip='Manage Keys'
                color={planExceeded ? grey300 : grey500}
                onClick={this.open2} />
              {
                (this.props.planId !== -1) &&
                <FileFileUpload style={iconStyles}
                  data-tip='Upgrade Plan'
                  color={grey500}
                  onClick={this.open3} />
              }
              {
                this.props.numMaxAPI !== null && this.props.numMaxStorage !== null && (this.props.apiUsed >= 80 || this.props.storageUsed >= 80) &&
                <span className='gps_ring upgrade_plan_beacon' />
              }
              <IconDelete style={iconStyles} data-tip='Delete App' color={grey500}
                onClick={this.delete} />
            </div> : null
          }
          {
            this.props.disabled && this.isAppAdmin()
              ? <div style={{ display: 'inline' }}>
                <IconDelete style={iconStyles} data-tip='Delete App' color={grey500}
                  onClick={this.delete} />
              </div> : null
          }
          {
            !this.props.disabled && !this.isAppAdmin()
              ? <div style={{ display: 'inline' }}>
                {/* call deletedev for exit */}
                <Exit style={iconStyles} data-tip='Remove Yourself' color={grey500}
                  onClick={this.exitApp} />

                <Key style={iconStyles}
                  data-tip='Manage Keys'
                  color={planExceeded ? grey300 : grey500}
                  onClick={this.open2} />
                {
                  (this.props.planId !== -1) &&
                    <FileFileUpload style={iconStyles} data-tip='Upgrade Plan' color={grey300} />
                }
                <IconDelete style={iconStyles} data-tip='Delete App' color={grey300} />
              </div> : null
          }

          <ReactTooltip place='bottom' type='dark' delayShow={100} />
        </div>

        {/* MODAL for project options */}

        {this.state.showDeleteModal &&
        <DeleteApp showDeleteModal={this.state.showDeleteModal} closeDeleteModal={this.closeDeleteModal}
          handleChange={this.handleChange} deleteButtonState={this.state.deleteButtonState}
          appId={this.props.appId} />
        }

        {this.state.showCancelModal &&
        <CancelPlan
          showCancelModal={this.state.showCancelModal}
          closeCancelModal={this.closeCancelModal}
          onCancel={this.handleCancelClick}
          appId={this.props.appId} />
        }

        {this.state.showUpgradeModal &&
        <UpgradePlan
          appId={this.props.appId}
          planId={this.props.planId}
          show={this.state.showUpgradeModal}
          close={this.closeUpgradeModal}
          showCancel={this.showCancel}
          {...this.props}
        />
        }

        {this.state.showExitModal &&
        <ExitApp handleChange={this.handleChange} deleteButtonState={this.state.deleteButtonState}
          appId={this.props.appId} show={this.state.showExitModal} close={this.closeExitModal}
          onDeleteDev={this.props.onDeleteDev} />
        }
        {this.state.showDeveloperModal &&
        <AddDeveloper show={this.state.showDeveloperModal} close={this.closeDeveloperModal}
          id={this.props._id} appId={this.props.appId} masterKey={this.props.keys.master}
          clientKey={this.props.keys.js} planId={this.props.planId}
          developers={this.props.developers} invited={this.props.invited}
          selectedTab={'addDev'} />
        }
        {this.state.showKeysModal &&
        <ManageKeys loading={this.props.loading} show={this.state.showKeysModal}
          close={this.closeKeyModal} id={this.props._id} appId={this.props.appId}
          masterKey={this.props.keys.master} clientKey={this.props.keys.js}
          planId={this.props.planId} developers={this.props.developers}
          invited={this.props.invited} selectedTab={'keys'} />
        }
      </div>
    </div>
  );
}
};
const mapStateToProps = (state, selfProps) => {
  let apiUsed = 0;
  let storageUsed = 0;
  let planExceeded = false;
  let numMaxAPI = 0;
  let numMaxStorage = 0;
  let maxAPI = '';
  let maxStorage = '';

  let plan = planList.filter(function (currPlan) {
    return currPlan.id === selfProps.planId;
  });
  plan = plan[0] || planList[0];

  numMaxAPI = plan.usage[0].features[0].limit.value;
  numMaxStorage = plan.usage[0].features[1].limit.value;
  maxAPI = plan.usage[0].features[0].limit.label;
  maxStorage = plan.usage[0].features[1].limit.label;

  if (!state.loader.loading) {
    if (state.analytics.bulkAnalytics.api) {
      let bulkAnalyticsAPI = state.analytics.bulkAnalytics.api.filter((app) => (app.appId === selfProps.appId))[0];
      if (bulkAnalyticsAPI) apiUsed = bulkAnalyticsAPI.monthlyApiCount;
    }
    if (state.analytics.bulkAnalytics.storage) {
      let bulkAnalyticsStorage = state.analytics.bulkAnalytics.storage.filter((app) => (app.appId === selfProps.appId))[0];
      if (bulkAnalyticsStorage) storageUsed = bulkAnalyticsStorage.size;
    }
  }

  // check if maxStorage used
  if (numMaxStorage !== null) {
    planExceeded = storageUsed >= (numMaxStorage * 1024);
  }

  if (numMaxAPI !== null) {
    planExceeded = planExceeded || (apiUsed >= numMaxAPI);
  }

  return {
    loading: state.loader.loading,
    planExceeded,
    maxAPI,
    maxStorage,
    numMaxAPI,
    numMaxStorage,
    apiUsed: numMaxAPI !== null ? Math.ceil(apiUsed ? (apiUsed / numMaxAPI) * 100 : 0) : apiUsed,
    storageUsed: numMaxStorage !== null ? Math.ceil(storageUsed ? ((storageUsed * 100) / (numMaxStorage * 1024)) : 0) : numMaxStorage,
    payments: state.user.payments || []
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleDrawer: (toggle) => dispatch(toggleDrawer(toggle)),
    onCancel: (appId, cancelOption) => dispatch(cancelPlan(appId, cancelOption))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Project);
