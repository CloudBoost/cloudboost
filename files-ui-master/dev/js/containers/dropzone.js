import React, {Component} from 'react';
import {Glyphicon} from 'react-bootstrap';
import {browserHistory, Link} from 'react-router';
import {addFile} from '../actions/index';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import DocumentList from '../containers/documentList';
import Dropzone from 'react-dropzone';
import {ProgressBar} from 'react-bootstrap'

class DropZone extends Component {
    constructor(props)
    {
        super(props);

        this.state = {
            location: this.props.location,
            uploading: false,
            uploadingFiles: []
        };

    }

    onDrop(acceptedFiles, rejectedFiles) {
        const {location} = this.state;
        this.props.addFile({
            path: decodeURIComponent(window.location.pathname),
            file: acceptedFiles,
            data: null,
            type: null
        });

    }

    render() {

        return (
            <Dropzone onDrop={this.onDrop.bind(this)} activeClassName="activeDropBody" className={this.props.className
                ? this.props.className + ' dropBody'
                : 'dropBody'} disableClick={this.props.disableClick}>{this.props.children}</Dropzone>
        )
    }

}

function mapStateToProps(state) {
    return {
        percentComplete: state.documents.percentComplete,
        fileAddSuccess: state.documents.fileAddSuccess,
        uploading: state.documents.uploading,
        uploadingFile: state.uploadingFiles.file,
        uploadProgress: state.uploadingFiles.uploadProgress,
        uploadedFiles: state.uploadingFiles.uploadedFiles
    };
}
function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        addFile: addFile
    }, dispatch);
}
export default connect(mapStateToProps, matchDispatchToProps)(DropZone);
