import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { fetchAllFiles } from '../../actions/files-ui';

class SideBar extends Component {
  static propTypes = {
    location: PropTypes.any,
    fetching: PropTypes.any,
    fetchAllFiles: PropTypes.any
  }

  constructor (props) {
    super(props);
    this.state = {
      location: this.props.location.pathname
    };
  }

  renderSpecificFileType (regex) {
    $('.side-menu-items').click(function () {
      $(this).addClass('side-item-selected');
      $(this)
        .siblings()
        .removeClass('side-item-selected');
    });

    if (!this.props.fetching) {
      this.props.fetchAllFiles({ path: this.state.location, regex: regex });
    }
  }
  componentDidMount () {
    $('.side-menu-items:first-child').addClass('side-item-selected');
    $('.side-menu-items:first-child')
      .siblings()
      .removeClass('side-item-selected');

    const { listen } = browserHistory;
    listen(location => {
      $('.side-menu-items:first-child').addClass('side-item-selected');
      $('.side-menu-items:first-child').siblings().removeClass('side-item-selected');
      this.setState({
        location: decodeURIComponent(location.pathname)
      });
    });
  }
  render () {
    return (
      <div className='side-menu-container'>
        <div id='side-menu'>
          <ul>
            <li
              className='side-menu-items'
              onClick={() => this.renderSpecificFileType('(.*)')}
            >
              <i className='fa fa-bars sidebar-icon' />
              &nbsp;&nbsp;All Files
            </li>
            <li
              className='side-menu-items'
              onClick={() => this.renderSpecificFileType(
                '((.*)openxmlformat(.*)|(.*)msword(.*)|(.*)vnd.ms-(.*)|(.*)pdf(.*))'
              )}
            >
              <i className='ion ion-document-text sidebar-icon' />
              &nbsp;&nbsp;Documents
            </li>
            <li
              className='side-menu-items'
              onClick={() => this.renderSpecificFileType('(.*)image(.*)')}
            >
              <i className='ion ion-images sidebar-icon' />
              &nbsp;&nbsp;Photos
            </li>
            <li
              className='side-menu-items'
              onClick={() => this.renderSpecificFileType('(.*)folder(.*)')}
            >
              <i className='ion ion-folder sidebar-icon' />
              &nbsp;&nbsp;Folders
            </li>
            <li
              className='side-menu-items'
              onClick={() => this.renderSpecificFileType('(.*)audio(.*)')}
            >
              <i className='ion ion-music-note ion-ios-videocam sidebar-icon' />
              &nbsp;&nbsp;Music
            </li>
            <li
              className='side-menu-items'
              onClick={() => this.renderSpecificFileType('(.*)video(.*)')}
            >
              <i className='ion ion-ios-videocam sidebar-icon' />
              &nbsp;&nbsp;Video
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
function mapStateToProps (state) {
  return { document: state.activeDoc };
}
function matchDispatchToProps (dispatch) {
  return bindActionCreators(
    {
      fetchAllFiles: fetchAllFiles
    },
    dispatch
  );
}
export default connect(
  mapStateToProps,
  matchDispatchToProps
)(SideBar);
