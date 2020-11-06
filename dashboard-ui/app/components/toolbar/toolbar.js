/**
 * Created by Darkstar on 11/29/2016.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'underscore';

import {
  updateBeacon,
  fetchApps,
  getNotifications,
  updateNotificationsSeen,
  deleteNotificationById,
  logOut,
  toggleDrawer
} from '../../actions';

import { DropDownMenu, MenuItem, IconButton, Popover } from 'material-ui';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import People from 'material-ui/svg-icons/social/people';

import NotificationsModal from '../notifications/notification';
import FeedbackModal from '../feedback/feedback';
import Profile from '../profile/profile';

const iconStyles = {
  marginRight: 12,
  marginLeft: 12,
  cursor: 'pointer'
};

export class ToolBar extends React.Component {
  static propTypes = {
    beacons: PropTypes.any,
    updateBeacon: PropTypes.any,
    fetchApps: PropTypes.any,
    deleteNotificationById: PropTypes.any,
    toggleDrawer: PropTypes.any,
    currentApp: PropTypes.any,
    currentUser: PropTypes.any,
    migrateTo: PropTypes.any,
    apps: PropTypes.any,
    isDashboardMainPage: PropTypes.any,
    updateNotificationsSeen: PropTypes.any,
    notifications: PropTypes.any,
    isAdmin: PropTypes.any,
    payments: PropTypes.any,
    onLogoutClick: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      open: false,
      appSelector: false,
      profileModal: false,
      options: false,
      value: 1
    };
  }

  static get contextTypes () {
    return { router: React.PropTypes.object.isRequired };
  }

    handleTouchTap = (which) => (event) => {
      event.preventDefault();
      this.state[which] = true;
      this.state.anchorEl = event.currentTarget;
      this.setState(this.state);

      // close the already opened popver after opening profile modal
      if (which === 'profileModal') { this.setState({ open: false }); }

      if (!this.props.beacons.firstLogin) { this.props.updateBeacon(this.props.beacons, 'firstLogin'); }
    };

    handleChange = (event, index, value) => this.setState({ value });

    handleRequestClose = () => {
      // close all popover
      this.setState({ open: false, appSelector: false, options: false, profileModal: false, value: 1 });
    };

    handleNotificationResponse = (type, data) => {
      if (type === 'addDeveloper') {
        this.props.fetchApps();
        this.props.deleteNotificationById(data);
      } else if (type === 'delete') {
        this.props.deleteNotificationById(data);
      }
    }

    redirectTo = (where, noAppId) => () => {
      if (noAppId) {
        this.context.router.push('/' + where);
        this.props.toggleDrawer(false);
      } else {
        this.context.router.push('/' + this.props.currentApp + '/' + where);
        this.props.toggleDrawer(true);
      }

      this.handleRequestClose();
    }

    redirectToApp = (appId) => () => {
      var currentRoute = window.location.pathname.split('/')[ window.location.pathname.split('/').length - 1 ];
      window.location.pathname = '/' + appId + '/' + currentRoute;
      this.handleRequestClose();
    }

    componentWillReceiveProps (nextProps) {
      if (!nextProps.currentUser.user.name) { window.location = window.ACCOUNTS_URL; }
    }

    setImgFallbackUrl (e) {
      e.target.onError = null;
      e.target.src = 'public/assets/images/default-app-icon.png';
    }

    handleDocumentationDrawer = () => {
      // Handling first ever click's analytics beacon.
      if (!this.props.beacons.documentationLink) {
        this.props.updateBeacon(this.props.beacons, 'documentationLink');
      }

      this.props.toggleDrawer(true);
    }

    render () {
      let migrateTo = this.props.migrateTo;
      let userImage = 'public/assets/images/user-image.png';
      let allApps = [];

      if (this.props.currentUser.file) { userImage = this.props.currentUser.file.document.url; }

      if (this.props.apps.length && !this.props.isDashboardMainPage && this.props.currentApp) {
        allApps = this.props.apps.map((app, i) => {
          let label = (
            <div>
              <img height='25px' width='25px'
                className='app-selector-img'
                src={window.SERVER_URL + '/appfile/' + app.appId + '/icon'}
                onError={this.setImgFallbackUrl}
                style={{ marginBottom: 3 }}
              />
              {app.name}
            </div>
          );

          let thisObj = this;
          return (
            <MenuItem
              className={app.appId === thisObj.props.currentApp ? 'selected-app app-list-item' : 'app-list-item'}
              innerDivStyle={{ 'display': 'inline-flex', 'alignItems': 'center' }}
              value={i}
              primaryText={app.name}
              key={i}
              label={label}
              onChange={console.log}
              onClick={this.redirectToApp(app.appId)}>
              <div height='20px'
                className='app-selector-img'
                style={{
                  background: 'url(' + window.SERVER_URL + '/appfile/' + app.appId + '/icon' + ') , url(public/assets/images/default-app-icon.jpg)',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center center',
                  height: '20px',
                  width: '20px'
                }} />
            </MenuItem>
          );
        });
      }

      let value = 0;
      if (this.props.apps) {
        value = _.pluck(this.props.apps, 'appId').indexOf(this.props.currentApp);
      }

      return (
        <div id='nav-dash' style={{
          backgroundColor: '#FFF',
          paddingTop: 2
        }}>
          <div className='container'>
            <Toolbar className='toolbar'
              style={{ backgroundColor: '#FFF' }}>

              <ToolbarGroup>

                <img style={{ marginLeft: -25 }}
                  className='icon cp'
                  src='public/assets/images/cblogo.png'
                  alt='cloud'
                  onClick={this.redirectTo('', true)} />

                <span style={{
                  color: 'rgba(0, 0, 0, 0.87)',
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: 15,
                  paddingTop: 27,
                  paddingLeft: 24
                }} />

                {
                  !this.props.isDashboardMainPage &&
                    <DropDownMenu value={value}
                      onChange={this.handleChange}
                      underlineStyle={{ display: 'none' }}
                      listStyle={{ 'paddingTop': '0px', 'paddingBottom': '0px' }}
                      // TODO : anchor origin and targe origin not working, please look into it
                      // anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                      // targetOrigin={{vertical: 'bottom', horizontal: 'right'}
                      style={{ marginTop: 0, borderRadius: 5 }}>

                      {allApps}

                      <MenuItem innerDivStyle={{ 'display': 'inline-flex', 'alignItems': 'center' }}
                        primaryText={'Dashboard'}
                        key={9999}
                        onClick={this.redirectTo('', true)}>
                        <img height='20px' className='app-selector-img'
                          src={'public/assets/images/dashboard-icon.png'} />

                      </MenuItem>
                    </DropDownMenu>
                }

              </ToolbarGroup>
              <ToolbarGroup>
                <div data-tip='Feedback' >
                  <FeedbackModal beacons={this.props.beacons}
                    updateBeacon={this.props.updateBeacon}
                    user={this.props.currentUser} />
                </div>
                <IconButton data-tip='Documentation' touch onClick={this.handleDocumentationDrawer}>
                  <a href={'#' + migrateTo}>
                    <svg xmlns='http://www.w3.org/2000/svg'
                      width='29'
                      height='29'
                      viewBox='0 -4 26 26'>

                      <g fill='none' fillRule='evenodd'>
                        <path fill='#9e9e9e'
                          d='M5.577 3c2.167 0 3.18.846 3.923 2.127v12.288c-.512 0-1.015-.337-1.33-.59-1.03-.828-3.057-.828-5.222-.828H1.945A.944.944 0 0 1 1 15.054V3.946c0-.522.423-.944.945-.944L5.577 3z' />
                        <path fill='#AAB7C4'
                          d='M13.423 3c-2.166 0-3.168.894-3.928 2.107L9.5 17.415c.512 0 1.015-.337 1.33-.59 1.03-.828 3.057-.828 5.222-.828h1.003a.944.944 0 0 0 .945-.945V3.947a.944.944 0 0 0-.945-.945L13.423 3z' />
                      </g>
                    </svg>
                  </a>
                </IconButton>
                <div data-tip='Notifications'>
                  <NotificationsModal updateNotificationsSeen={this.props.updateNotificationsSeen}
                    handleNotificationResponse={this.handleNotificationResponse}
                    userId={this.props.currentUser.user._id || ''}
                    notifications={this.props.notifications || []} />
                </div>
                {
                  this.props.isAdmin &&
                    <IconButton data-tip='Manage Developers' onClick={this.redirectTo('admin', true)}>
                      <People style={iconStyles}
                        color='#AAB7C4'
                        onClick={this.redirectTo('admin', true)} />
                    </IconButton>
                }

                <Popover open={this.state.open}
                  anchorEl={this.state.anchorEl}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  targetOrigin={{ horizontal: 'right', vertical: 'top' }}
                  onRequestClose={this.handleRequestClose}
                  animated
                  className='profilepop'>

                  <p className='headingpop'>
                    { this.props.currentUser.user && this.props.currentUser.user.name.toLowerCase() }
                  </p>
                  {
                    !!this.props.payments.length &&
                      <button className='coloptbtn' onClick={this.redirectTo('payment', true)}>
                                        Payment
                      </button>
                  }

                  <button className='coloptbtn' onClick={this.handleTouchTap('profileModal')}>
                                    My Profile
                  </button>
                  <button className='coloptbtn' id='logout' onClick={this.props.onLogoutClick}>
                                    Logout
                  </button>
                </Popover>

                <IconButton ref={(c) => (this.settingsElement = c)}
                  onClick={this.handleTouchTap('open')}>
                  <img className='userhead' id='userAvatar' src={userImage} alt='' />
                </IconButton>
              </ToolbarGroup>
            </Toolbar>
          </div>
          <Profile open={this.state.profileModal} close={this.handleRequestClose} />
        </div>
      );
    }
}

const mapStateToProps = (state) => {
  let isAdmin = false;
  if (state.user.user) {
    isAdmin = state.user.user.isAdmin;
  }
  return {
    currentApp: state.manageApp.appId,
    currentPlanId: state.manageApp.planId,
    currentUser: state.user,
    currentAppName: state.manageApp.name,
    isAdmin,
    apps: state.apps,
    beacons: state.beacons,
    notifications: state.notifications.notifications,
    migrateTo: state.drawer.migrateTo,
    openDrawer: state.drawer.openDrawer,
    payments: state.user.payments
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLogoutClick: () => {
      dispatch(logOut());
    },
    updateBeacon: (beacons, which) => dispatch(updateBeacon(beacons, which)),
    fetchApps: () => dispatch(fetchApps()),
    getNotifications: () => dispatch(getNotifications()),
    updateNotificationsSeen: () => dispatch(updateNotificationsSeen()),
    deleteNotificationById: (id) => dispatch(deleteNotificationById(id)),
    toggleDrawer: (toggle) => dispatch(toggleDrawer(toggle))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolBar);
