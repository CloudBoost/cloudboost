import React, {Component} from 'react';
import {fetchAllFiles} from '../actions/index'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {browserHistory} from "react-router";

class SideBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            location: this.props.location.pathname
        };
    }

    renderSpecificFileType(regex) {
        $(".side-menu-items").click(function() {
            $(this).addClass("side-item-selected");
            $(this).siblings().removeClass("side-item-selected");
        });
        if (!this.props.fetching)
            this.props.fetchAllFiles({path: this.state.location, regex: regex})
    }
    componentDidMount(){
            $(".side-menu-items:first-child").addClass("side-item-selected");
            $(".side-menu-items:first-child").siblings().removeClass("side-item-selected");
    }
    render() {
        const {listen} = browserHistory;
        listen(location => {
            $(".side-menu-items:first-child").addClass("side-item-selected");
            $(".side-menu-items:first-child").siblings().removeClass("side-item-selected");
            this.setState({
                location: decodeURIComponent(location.pathname)
            });

        });

        return (
            <div className="side-menu-container">
                <div id="side-menu">
                    <ul >

                        <li className="side-menu-items" onClick={this.renderSpecificFileType.bind(this, '(.*)')}>
                            <i className="fa fa-bars sidebar-icon"></i>
                            &nbsp;&nbsp;All Files
                        </li>
                        <li className="side-menu-items" onClick={this.renderSpecificFileType.bind(this, '((.*)openxmlformat(.*)|(.*)msword(.*)|(.*)vnd.ms-(.*)|(.*)pdf(.*))')}>
                            <i className="ion ion-document-text sidebar-icon"></i>
                            &nbsp;&nbsp;Documents
                        </li>
                        <li className="side-menu-items" onClick={this.renderSpecificFileType.bind(this, '(.*)image(.*)')}>
                            <i className="ion ion-images sidebar-icon"></i>
                            &nbsp;&nbsp;Photos
                        </li>
                        <li className="side-menu-items" onClick={this.renderSpecificFileType.bind(this, '(.*)folder(.*)')}>
                            <i className="ion ion-folder sidebar-icon"></i>
                            &nbsp;&nbsp;Folders
                        </li>
                        <li className="side-menu-items" onClick={this.renderSpecificFileType.bind(this, '(.*)audio(.*)')}>
                            <i className="ion ion-music-note ion-ios-videocam sidebar-icon"></i>
                            &nbsp;&nbsp;Music
                        </li>
                        <li className="side-menu-items" onClick={this.renderSpecificFileType.bind(this, '(.*)video(.*)')}>
                            <i className="ion ion-ios-videocam sidebar-icon"></i>
                            &nbsp;&nbsp;Video
                        </li>

                    </ul>
                </div>
            </div>

        );
    }

}
function mapStateToProps(state) {
    return {document: state.activeDoc};
}
function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        fetchAllFiles: fetchAllFiles
    }, dispatch);
}
export default connect(mapStateToProps, matchDispatchToProps)(SideBar);
