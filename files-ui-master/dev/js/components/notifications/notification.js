import React from 'react';
import Popover from 'material-ui/Popover';
import {xhrClient} from './xhrClient';
import _ from 'underscore';
import IconButton from 'material-ui/IconButton';
import {showAlert} from '../../actions/index';
import moment from "moment";

//css
require('./styles.css');

class Notifications extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            notifications: [],
            showUpgradeModal: false
        }
    }

    componentWillMount = () => this.setState({notifications: this.props.notifications});

    componentWillReceiveProps(nextProps) {
        if (nextProps.notifications !== this.props.notifications) {
            this.setState({notifications: nextProps.notifications});
        }
    }

    handleTouchTap = (event) => {
        event.preventDefault();
        this.setState({open: true, anchorEl: event.currentTarget})
    };

    clearNotifications = () => this.props.updateNotificationsSeen();

    handleRequestClose = () => this.setState({open: false});

    closeUpgradeModal = () => this.setState({showUpgradeModal: false});

    handleNotificationResponse = (type) => this.props.handleNotificationResponse.bind(this, type);

    callAction(data, obj) {

        let {meta} = obj;
        let {url, method, payload, external} = data;
        let thisObj = this;

        if (meta.notificationType === 'payment') {
            this.setState({showUpgradeModal: true, appId: data.appId, planId: data.planId, open: false})
        }
        else if (!external) {
            xhrClient({url: url, method: method, data: payload})
                .then(function (res) {
                    thisObj.props.handleNotificationResponse(meta.notificationType, obj._id);
                }, function (err) {
                    console.log(err);
                    showAlert('error', err);
                });
        }
        else
            window.open(url, '_blank');
    }

    deleteNotification = id => this.props.handleNotificationResponse('delete', id);

    render() {

        let {notifications} = this.state;

        let pendingTasks = notifications.length;
        let unSeenNotifications = _.where(notifications, {seen: false}).length;

        let notificationDiv = notifications.map((x, i) => {
            let cancelButton = null;
            let acceptButton = null;
            if (x.meta) {
                cancelButton = x.meta.cancelButton;
                acceptButton = x.meta.acceptButton;
            }

            let getTime = (x) => {
                let notTime = moment(x.date);
                let secs = moment().diff(notTime, 'seconds');
                return (secs > 172800) ? notTime.format("Do MMMM") : moment.duration(secs, 'seconds').humanize() + " ago"
            };

            return (
                <div className={x.seen ? "notificationdiv" : "notificationdiv unSeenNotification"} key={i}>
                    <div className="notimgcontainer">
                        {
                            x.icon ?
                                <img src={x.icon} className="notinvicon"/>
                                :
                                <i className="ion ion-ios-bell notinvicon"/>
                        }
                    </div>
                    <div className="notdatacontainer">
                        <p className="nottextinv" dangerouslySetInnerHTML={{__html: x.text}}/>
                        <div className="noteinvbtncontainer">
                            <span className="nottimestamp"> {getTime(x)} </span>
                            {
                                cancelButton &&
                                <button className="cancelbtnnotinv"
                                        onClick={this.callAction.bind(this, cancelButton, x)}>
                                    {cancelButton.text}
                                </button>
                            }
                            {
                                acceptButton &&
                                <button className="acceptbtnnotinv"
                                        onClick={this.callAction.bind(this, acceptButton, x)}>
                                    {acceptButton.text}
                                </button>
                            }
                            {
                                x.notificationType === "inform" &&
                                <button className="acceptbtnnotinv"
                                        onClick={this.deleteNotification.bind(this, x._id)}>
                                    Okay
                                </button>
                            }
                        </div>
                    </div>
                </div>
            )
        });

        return (
            <div>
                {
                    this.state.showUpgradeModal &&
                    <Upgrade appId={this.state.appId}
                             planId={this.state.planId}
                             show={this.state.showUpgradeModal}
                             close={this.closeUpgradeModal}/>
                }

                <IconButton touch={true} onTouchTap={this.handleTouchTap}>

                    {unSeenNotifications && <div className="red-dot"/>}

                    <svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 -3 26 26">
                        <g fill="none" fillRule="evenodd">
                            <path fill="#AAB7C4"
                                  d="M7.65 16.914A2.721 2.721 0 0 0 10.298 19c1.282 0 2.36-.886 2.647-2.086H7.65zm7.917-8.129a50.014 50.014 0 0 1-.45-2.963c-.242-2.031-2.076-3.56-4.246-3.56h-.86c-2.17 0-4.004 1.529-4.245 3.56a47.54 47.54 0 0 1-.451 2.963c-.42 2.314-1.342 3.98-2.097 5.11-.576.859.053 1.98 1.133 1.82h12.117c1.08.16 1.72-.961 1.133-1.82-.85-1.256-1.657-3.026-2.034-5.11zm-5.137-6.69a1.048 1.048 0 1 0 .002-2.096 1.048 1.048 0 0 0-.002 2.095z"/>
                        </g>
                    </svg>
                </IconButton>

                <Popover open={this.state.open}
                         anchorEl={this.state.anchorEl}
                         anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                         targetOrigin={{horizontal: 'right', vertical: 'top'}}
                         onRequestClose={this.handleRequestClose}
                         className="popovernotifications">

                    <p className="headingpop">Notifications
                        <button className={pendingTasks ? "clearnotbtn" : "hide"}
                                onClick={this.clearNotifications.bind(this)}>
                            Mark All as read
                        </button>
                    </p>
                    {
                        !pendingTasks ?
                            <div style={{textAlign: 'center'}}>
                                <i className="ion-ios-bell notificationemptybell"/>
                                <p className="notificationemptymessage">
                                    We'll let you know when we've got something new for you!
                                </p>
                            </div>
                            :
                            <div className="notification-wrap">{notificationDiv}</div>
                    }
                </Popover>
            </div>
        )
    }
}

export default Notifications;
