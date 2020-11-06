import React from 'react';
import SideBar from '../containers/sidebar';
import {initApp} from '../actions/index';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {browserHistory, Link} from 'react-router';
import {Navbar, Nav, NavItem, NavDropdown, Dropdown} from 'react-bootstrap';

import {IconButton, MenuItem, Menu, Popover, DropDownMenu} from 'material-ui'
import DashboardIcon from 'material-ui/svg-icons/action/dashboard';
import DownArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import _ from 'underscore';
import HeaderMain from './header/headerMain.js';
import 'react-select/dist/react-select.css';

export class App extends React.Component {
    constructor(props)
    {
        super(props);
        this.props.initApp(this.props.params.appId);
        this.state = {
            scroll: {},
            open: false,
            value: 1
        };

    }
    handleTouchTap = (event) => {
        // This prevents ghost click.
        event.preventDefault();

        this.setState({open: true, anchorEl: event.currentTarget});
    };

    handleRequestClose = () => {
        this.setState({open: false});
    };

    navigate(route, opts) {
        if (opts) {
            browserHistory.push(route);
            this.props.initApp(this.props.params.appId);
        } else {
            location.assign(route);
        }
    }

    handleChange = (event, index, value) => this.setState({value});

    render() {

        return (
            <div>
                <HeaderMain/>
                <div class="container">
                    <div className="child-container">
                        <div className=" col-md-2 col-sm-3 hidden-xs">
                            <SideBar location={this.props.location}/>
                        </div>
                        <div className="container-fluid" style={{marginLeft: 200}}>
                            <div class="below-navbar visible-xs-block ">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td class="top-menu-item" onClick={this.navigate.bind(this, ANALYTICS_BASE_URL + this.props.appId + '/' + 'segmentation', true)}>
                                                <i class="ion ion-pie-graph"></i>
                                                &nbsp;&nbsp;<span>Segementation</span>
                                            </td>
                                            <td class="top-menu-item" onClick={this.navigate.bind(this, ANALYTICS_BASE_URL + this.props.appId + '/' + 'funnel', true)}>
                                                <i class="ion ion-funnel"></i>
                                                &nbsp;&nbsp;<span>Funnel</span>
                                            </td>
                                            <td class="top-menu-item" onClick={this.navigate.bind(this, ANALYTICS_BASE_URL + this.props.appId + '/' + 'live', true)}>
                                                <i class="ion ion-ios-pulse-strong"></i>
                                                &nbsp;&nbsp;<span>Live View</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="mainbody">
                                {this.props.children}
                            </div>
                        </div>

                    </div>
                    <Navbar class="navbar-style navbar-border " collapseOnSelect fixedBottom={true}>
                        <Navbar.Brand>
                            <a class="footer-item" href="https://cloudboost.io">&copy; {(new Date()).getFullYear()}&nbsp; CloudBoost</a>
                        </Navbar.Brand>
                        <Navbar.Toggle/>

                        <Navbar.Collapse>
                            <Nav >
                                <NavItem eventKey={2} class="footer-item" href='https://cloudboost.io/terms' onClick={this.navigate.bind(this, 'https://cloudboost.io/terms')}>Terms</NavItem>
                                <NavItem eventKey={3} class="footer-item" onClick={this.navigate.bind(this, 'https://cloudboost.io/privacy')} href='https://cloudboost.io/privacy'>Privacy</NavItem>
                                <NavItem eventKey={4} class="footer-item" onClick={this.navigate.bind(this, 'https://slack.cloudboost.io/')} href='https://slack.cloudboost.io/'>Help</NavItem>
                            </Nav>
                            <Nav pullRight>
                                <NavItem eventKey={6} class="footer-item" onClick={this.navigate.bind(this, 'https://tutorials.cloudboost.io/en/datastorage/files#')} href='https://tutorials.cloudboost.io/en/datastorage/files#'>Documentation</NavItem>

                            </Nav>

                        </Navbar.Collapse>
                    </Navbar>

                </div>
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
        init
    } = state.app;
    return {
        allApps,
        appName,
        appId,
        userProfilePic,
        appInitSuccess,
        init
    };
}
function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        initApp: initApp
    }, dispatch);
}
export default connect(mapStateToProps, matchDispatchToProps)(App);
