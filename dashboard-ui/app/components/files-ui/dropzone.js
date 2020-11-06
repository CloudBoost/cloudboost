import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';

import { addFile } from '../../actions/files-ui';

class DropZone extends Component {
  static propTypes = {
    location: PropTypes.any,
    addFile: PropTypes.any,
    className: PropTypes.any,
    disableClick: PropTypes.any,
    children: PropTypes.any

  }

  constructor (props) {
    super(props);

    this.state = {
      location: this.props.location,
      uploading: false,
      uploadingFiles: []
    };
  }

  onDrop (acceptedFiles, rejectedFiles) {
    this.props.addFile({
      path: decodeURIComponent(window.location.pathname),
      file: acceptedFiles,
      data: null,
      type: null
    });
  }

  render () {
    return (
      <Dropzone onDrop={(e) => this.onDrop(e)} activeClassName='activeDropBody' className={this.props.className
        ? this.props.className + ' dropBody'
        : 'dropBody'} disableClick={this.props.disableClick}>
        {this.props.children}
      </Dropzone>
    );
  }
}

function mapStateToProps (state) {
  return {
    percentComplete: state.documents.percentComplete,
    fileAddSuccess: state.documents.fileAddSuccess,
    uploading: state.documents.uploading,
    uploadingFile: state.uploadingFiles.file,
    uploadProgress: state.uploadingFiles.uploadProgress,
    uploadedFiles: state.uploadingFiles.uploadedFiles
  };
}
function matchDispatchToProps (dispatch) {
  return bindActionCreators({
    addFile: addFile
  }, dispatch);
}
export default connect(mapStateToProps, matchDispatchToProps)(DropZone);
