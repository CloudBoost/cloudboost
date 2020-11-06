import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import SideBar from './sidebar';
import { initApp } from '../../actions/files-ui';

import '../../styles/css/files-ui.css';

class FilesPage extends React.Component {
  static propTypes = {
    params: PropTypes.any,
    location: PropTypes.any,
    children: PropTypes.any,
    initApp: PropTypes.any
  }

  constructor (props) {
    super(props);
    this.props.initApp(this.props.params.appId);
  }
  render () {
    return (
      <div>
        <div className='container-fluid sub-container'>
          <div className='row'>
            <div>
              <SideBar location={this.props.location} />
            </div>
            <div className='sub-container__mainBody'>
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps (state) {
  return {
    fetching: state.documents.fetching,
    fileAddSuccess: state.documents.fileAddSuccess,
    allApps: state.documents.allApps,
    appName: state.documents.appName,
    appId: state.documents.appId,
    userProfilePic: state.documents.userProfilePic
  };
}

function matchDispatchToProps (dispatch) {
  return bindActionCreators({ initApp: initApp }, dispatch);
}

export default connect(
  mapStateToProps,
  matchDispatchToProps
)(FilesPage);
