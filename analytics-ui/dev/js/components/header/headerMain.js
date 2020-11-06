import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
    initApp,
    fetchAllEvents,
    updateBeacon,
    updateNotificationsSeen,
    deleteNotificationById,
    getNotifications,
    logOut
} from '../../actions';

import {DropDownMenu, MenuItem, IconButton, Popover,} from 'material-ui';
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';

import NotificationsModal from './notifications/notification';
import FeedbackModal from './feedback/feedback';
import _ from 'underscore'

export class ToolBar extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            open: false,
            appSelector: false,
            profileModal: false,
            options: false,
            value: 1
        }
    }

    static get contextTypes() {
        return {router: React.PropTypes.object.isRequired}
    }

    handleTouchTap = (which, event) => {
        event.preventDefault()
        this.state[which] = true
        this.state.anchorEl = event.currentTarget
        this.setState(this.state);
        // close the already opened popver after opening profile modal
        if (which === 'profileModal')
            this.setState({open: false})
    };

    handleChange = (event, index, value) => this.setState({value});

    redirectTo(where, noAppId) {
        if (noAppId) {
            this.context.router.push(ANALYTICS_BASE_URL + where)
        } else {
            this.context.router.push(ANALYTICS_BASE_URL + this.props.appId + "/" + where)
        }
        this.handleRequestClose()
    }

    navigate(appId) {
        this.context.router.push(ANALYTICS_BASE_URL + appId)
        this.props.initApp(appId);
    }

    handleRequestClose = () => {
        // close all popover
        this.setState({open: false, appSelector: false, options: false, profileModal: false})
    }

    setImgFallbackUrl(e) {
        e.target.onError = null;
        e.target.src = 'src/assets/img/default-app-icon.png';
    }

    handleNotificationResponse(type, data) {
        if (type === 'addDeveloper') {
            this.props.deleteNotificationById(data);
            window.location.href = DASHBOARD_URL;
        }
        else if (type === 'delete') {
            this.props.deleteNotificationById(data);
        }
        this.props.getNotifications()
    }

    render() {
        let userImage = "src/assets/img/user-image.png";
        let allApps = [];

        if (this.props.user.file)
            userImage = this.props.user.file.document.url;

        if (this.props.allApps.length && this.props.appId) {

            allApps = this.props.allApps.map((app, i) => {
                let label = (
                    <div>
                        <img height="25px" width="25px"
                             className="app-selector-img"
                             src={SERVER_URL + 'appfile/' + app.appId + '/icon'}
                             onError={this.setImgFallbackUrl}
                             style={{marginBottom: 3}}
                        />
                        {app.name}
                    </div>
                );

                let thisObj = this;
                return (
                    <MenuItem className={app.appId === thisObj.props.appId?'selected-app app-list-item':'app-list-item'}
                              innerDivStyle={{ "display": "inline-flex", "alignItems": "center" }}
                              value={i}
                              primaryText={app.name}
                              key={i}
                              label={label}
                              onClick={this.navigate.bind(this, app.appId)}>
                        <div height="20px"
                             className="app-selector-img"
                             style={{
                                 background: 'url(' + SERVER_URL + 'appfile/' + app.appId + '/icon' + ') , url(src/assets/images/default-app-icon.jpg)',
                                 backgroundSize: 'cover',
                                 backgroundRepeat: 'no-repeat',
                                 backgroundPosition: 'center center',
                                 height: '20px',
                                 width: '20px'
                             }}/>
                    </MenuItem>
                );
            })
        }

        let value = 0;
        if (this.props.allApps) {
            value = _.pluck(this.props.allApps, 'appId').indexOf(this.props.appId);
        }

        return (
            <div id="nav-dash" style={{
                backgroundColor: '#FFF',
                paddingTop: 2
            }}>
                <div className="container">
                    <Toolbar className='toolbar'
                             style={{backgroundColor: '#FFF'}}>

                        <ToolbarGroup>

                            <img className="icon cp"
                                 src="src/assets/img/cblogo.png"
                                 alt="cloud"
                                 onClick={this.redirectTo.bind(this, '', true)}/>
                            <DropDownMenu value={value}
                                          onChange={this.handleChange}
                                          underlineStyle={{display: "none"}}
                                          listStyle={{'paddingTop': '0px', 'paddingBottom': '0px'}}>
                                {allApps}

                                <MenuItem innerDivStyle={{"display": "inline-flex", "alignItems": "center"}}
                                          primaryText={'Dashboard'}
                                          key={9999}
                                          onClick={this.redirectTo.bind(this, '', true)}>
                                    <img height="20px" className="app-selector-img"
                                         src={'..src/assets/img/dashboard-icon.png'}/>

                                </MenuItem>
                            </DropDownMenu>

                        </ToolbarGroup>
                        <ToolbarGroup>

                            <FeedbackModal beacons={this.props.beacons}
                                           updateBeacon={this.props.updateBeacon}
                                           user={this.props.user}/>

                            <IconButton touch={true} onClick={this.handleTouchTap.bind(this, 'options')}>
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         width="29"
                                         height="29"
                                         viewBox="0 -4 26 26">

                                        <g fill="none" fillRule="evenodd">
                                            <path fill="#9e9e9e"
                                                  d="M5.577 3c2.167 0 3.18.846 3.923 2.127v12.288c-.512 0-1.015-.337-1.33-.59-1.03-.828-3.057-.828-5.222-.828H1.945A.944.944 0 0 1 1 15.054V3.946c0-.522.423-.944.945-.944L5.577 3z"/>
                                            <path fill="#AAB7C4"
                                                  d="M13.423 3c-2.166 0-3.168.894-3.928 2.107L9.5 17.415c.512 0 1.015-.337 1.33-.59 1.03-.828 3.057-.828 5.222-.828h1.003a.944.944 0 0 0 .945-.945V3.947a.944.944 0 0 0-.945-.945L13.423 3z"/>
                                        </g>
                                    </svg>
                            </IconButton>

                            <Popover open={this.state.open}
                                     anchorEl={this.state.anchorEl}
                                     anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                                     targetOrigin={{horizontal: 'right', vertical: 'top'}}
                                     onRequestClose={this.handleRequestClose}
                                     animated={true}
                                     className="profilepop">

                                <p className="headingpop">
                                    { this.props.user.user && this.props.user.user.name &&this.props.user.user.name.toLowerCase() }
                                </p>

                                <button className="coloptbtn" onClick={this.handleTouchTap.bind(this, 'profileModal')}>
                                    My Profile
                                </button>
                                <button className="coloptbtn" onClick={logOut}>
                                    Logout
                                </button>
                            </Popover>

                            <NotificationsModal updateNotificationsSeen={this.props.updateNotificationsSeen.bind(this)}
                                                handleNotificationResponse={this.handleNotificationResponse.bind(this)}
                                                userId={this.props.user.user._id || ''}
                                                notifications={this.props.notifications || []}/>



                            <IconButton onClick={this.handleTouchTap.bind(this, 'open')}>
                                <img className="userhead" src={userImage} alt="User Profile Pic"/>
                            </IconButton>
                        </ToolbarGroup>
                    </Toolbar>
                </div>
                {/*<Profile open={this.state.profileModal} close={this.handleRequestClose}/>*/}
            </div>
        )
    }
}

function mapStateToProps(state) {
    const {
        allApps,
        appName,
        appId,
        userProfilePic,
        appInitSuccess,
        fetchingEvents,
        init
    } = state.app;

    const {user} = state.user;

    return {
        allApps: allApps || [],
        appName,
        appId,
        userProfilePic,
        appInitSuccess,
        fetchingEvents,
        init,
        user,
        beacons: state.beacons,
        notifications: state.notifications.notifications
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        initApp,
        fetchAllEvents,
        updateBeacon: (beacons, which) => dispatch(updateBeacon(beacons, which)),
        getNotifications: () => dispatch(getNotifications()),
        updateNotificationsSeen: () => dispatch(updateNotificationsSeen()),
        deleteNotificationById: (id) => dispatch(deleteNotificationById(id)),
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ToolBar);
