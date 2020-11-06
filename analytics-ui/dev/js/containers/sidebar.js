import React, {Component} from 'react';
import {Glyphicon} from 'react-bootstrap';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {browserHistory, Link} from "react-router";

class SideBar extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    static get contextTypes() {
        return {router: React.PropTypes.object.isRequired}
    }
    navigate(route) {
        browserHistory.push(ANALYTICS_BASE_URL + this.props.currentAppId + '/' + route);
    }
    isLinkActive(route) {
        if(route) {
            let location = browserHistory.getCurrentLocation().pathname.toLowerCase();
            if((location===ANALYTICS_BASE_URL+this.props.currentAppId || location===ANALYTICS_BASE_URL+this.props.currentAppId+'/' )&& route==='segmentation')
                return 'selected'
            return location.indexOf(route) != -1 ? 'selected' : '';
        }
    }

    render() {
        return (
            <div className="affix sidebar">
                <div id="side-menu">
                    <ul >
                        <li className={`side-menu-items ${this.isLinkActive('segmentation')}`} onClick={this.navigate.bind(this, 'segmentation')}>
                            <i className="ion ion-pie-graph"></i>
                            Segementation
                        </li>
                        <li className={`side-menu-items ${this.isLinkActive('funnel')}`} onClick={this.navigate.bind(this, 'funnel')}>
                            <i className="ion ion-funnel"></i>
                            Funnel
                        </li>
                        <li className={`side-menu-items ${this.isLinkActive('live')}`} onClick={this.navigate.bind(this, 'live')}>
                            <i className="ion ion-ios-pulse-strong"></i>
                            Live View
                        </li>

                    </ul>
                </div>
            </div>
        );
    }

}
function mapStateToProps(state) {
    return {currentAppId: state.app.appId};
}
function matchDispatchToProps(dispatch) {
    return bindActionCreators({}, dispatch);
}
export default connect(mapStateToProps, matchDispatchToProps)(SideBar);
