import React from 'react';
import SideBar from '../containers/sidebar';
import {initApp} from '../actions/index';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import {Navbar, Nav, NavItem} from 'react-bootstrap';
import Header from './header';
import '../../css/drawer.css';
import QuickDocs from './drawer/drawer';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.props.initApp(this.props.params.appId);
    }

    navigate(route, opts) {
        if (opts) {
            browserHistory.push(route);
            this.props.initApp(this.props.params.appId);
        }
        else {
            window.open(route, '_blank');
        }
    }

    setImgFallbackUrl(e) {
        e.target.onError = null;
        e.target.src = 'src/assets/default-app-icon.png';
    }

    render() {

        let profilePic = <i className="ion ion-person profile-icon" />;
        if (this.props.userProfilePic) {
            profilePic = <img src={this.props.userProfilePic} className="profilePic" />
        }

        return (

            <div>
                <Header/>
                <QuickDocs/>
                <div className="container-fluid sub-container">
                    <div className="row">
                        <div >
                            <SideBar location={this.props.location}/>
                        </div>
                        <div className="sub-container__mainBody">
                            {this.props.children}
                        </div>

                    </div>
                </div>
                <Navbar className="navbar-style navbar-border " style={{zIndex: 1}} collapseOnSelect fixedBottom={true}>
                    <Navbar.Brand>
                        <a className="footer-item" href="https://cloudboost.io">
                            &copy; {(new Date()).getFullYear()}&nbsp;CloudBoost
                        </a>
                    </Navbar.Brand>
                    <Navbar.Toggle/>

                    <Navbar.Collapse>
                        <Nav>
                            <NavItem eventKey={2} className="footer-item" href='https://cloudboost.io/terms'
                                     onClick={this.navigate.bind(this, 'https://cloudboost.io/terms', false)}>Terms</NavItem>
                            <NavItem eventKey={3} className="footer-item"
                                     onClick={this.navigate.bind(this, 'https://cloudboost.io/privacy', false)}
                                     href='https://cloudboost.io/privacy'>Privacy</NavItem>
                            <NavItem eventKey={4} className="footer-item"
                                     onClick={this.navigate.bind(this, 'https://slack.cloudboost.io/', false)}
                                     href='https://slack.cloudboost.io/'>Help</NavItem>
                        </Nav>
                        <Nav pullRight>
                            <NavItem eventKey={6} className="footer-item"
                                     onClick={this.navigate.bind(this, 'https://tutorials.cloudboost.io/en/datastorage/files#', false)}
                                     href='https://tutorials.cloudboost.io/en/datastorage/files#'>Documentation</NavItem>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        fetching: state.documents.fetching,
        fileAddSuccess: state.documents.fileAddSuccess,
        allApps: state.documents.allApps,
        appName: state.documents.appName,
        appId: state.documents.appId,
        userProfilePic: state.documents.userProfilePic
    };
}

function matchDispatchToProps(dispatch) {
    return bindActionCreators({ initApp: initApp }, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(App);
