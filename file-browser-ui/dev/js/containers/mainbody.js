import React, {Component} from 'react';
import {Modal, Button} from 'react-bootstrap';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import DocumentList from '../containers/documentList';
import { fetchAllFiles, addFile, sortDocuments} from '../actions/index';
import DropZone from './dropzone';
import {browserHistory, Link} from "react-router";
import ReactTooltip from 'react-tooltip';

class MainBody extends Component {

    constructor(props) {
        super(props);
        this.state = {
            location: decodeURIComponent(this.props.location.pathname),
            error: { folderNameLengthIsZero: false }
        };
    }

    close() {
        this.setState({showUploadModal: false, showCreateModal: false});
    }

    open(type) {
        this.setState({
            showUploadModal: (type === 'upload'),
            showCreateModal: (type !== 'upload')
        });
    }

    addFolder(e) {

        const value = (document.getElementById('folderName').value);

        if (value.length !== 0) {
            this.state.error = { folderNameLengthIsZero: false };
            this.setState(this.state);
            this.props.addFile({path: this.state.location, file: [value], data: 'folder', type: 'folder/folder'});
            this.close();
        }
        else {
            this.state.error = { folderNameLengthIsZero: true };
            this.setState(this.state);
        }
    }

    handleChange(e) {
        if (!this.props.fetching)
            this.props.fetchAllFiles({path: this.state.location, searchText: e.target.value, regex: this.props.regex})
    }

    openClick() {
        console.log('yhh');
    }

    animateSearchBox(isFocus) {
        if (isFocus) {
            $('.upload-icon').css({'display': 'none'});
            $('.create-folder-icon').css({'display': 'none'});
            $('.inlineRight').css({'width': '50%'});

        }
        else {
            $('.upload-icon').css({'display': 'inline-block'});
            $('.create-folder-icon').css({'display': 'inline-block'});
            $('.inlineRight').css({'width': 'initial'});
        }
    }

    componentDidMount(){
        const {listen} = browserHistory;
        listen(location => this.setState({location: decodeURIComponent(location.pathname)}));
    }

    render() {

        let {location} = this.state;
        const a = ("/" + location).replace(FILES_BASE_URL,'').split("/");
        let link = "";

        if (a[0] === "")
            a.splice(0, 1);

        const breadcrumb = a.map((b, i) => {
            link = link + "/" + b;
            if (b !== 'home' && i !== 0)
                return (
                    <span key={i}>&nbsp;
                        <i className="icon ion-chevron-right breadcrumb-color" />
                        <Link key={i} to={link}> {b} </Link>
                    </span>
                );
            }
        );

        return (
            <div>
                <div className="row-fluid">
                    <div className=" col-md-12 ">
                        <div className="below-navbar ">

                            <span className="inlineLeft">
                                <h4 className=" inline breadcrumb-row">
                                    <Link to={FILES_BASE_URL + this.props.appId}>HOME</Link>
                                    {breadcrumb}
                                </h4>
                            </span>
                            <span className="inlineRight">
                                <DropZone className="upload-icon"
                                          location={this.state.location}
                                          disableClick={false}>
                                    <img data-tip="Upload File"
                                         className="inline upload-icon"
                                         onClick={this.open.bind(this, 'upload')}
                                         src="src/assets/fileadd.png"
                                         width="25px"/>
                                </DropZone>
                                <ReactTooltip place="bottom" effect="solid"/>
                                
                                    <img data-tip="New Folder"
                                        className="inline create-folder-icon"
                                        onClick={this.open.bind(this, 'create')}
                                        src="src/assets/folderadd.png"
                                            width="25px" height="25px" />
                               

                                <div className="search-bar-container">
                                    <input type="text"
                                        className="inline search-bar"
                                        onChange={this.handleChange.bind(this)}
                                        placeholder="Search"
                                        onFocus={this.animateSearchBox.bind(this, true)}
                                        onBlur={this.animateSearchBox.bind(this, false)}/>
                                </div>
                            </span>

                            <Modal className="small-height-modal" show={this.state.showCreateModal}
                                   onHide={this.close.bind(this)}>
                                <Modal.Header className="modal-header-style">
                                    <Modal.Title>
                                        <span className="new-folder-modal-title"> New Folder </span>
                                        <img className="create-folder-modal-icon-style pull-right"/>
                                        <div className="modal-title-inner-text">Create a new folder.</div>
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    {
                                        this.state.error.folderNameLengthIsZero &&
                                        <span className="error-text">Folder Name is required</span>
                                    }
                                    <input className="" id="folderName" placeholder="Enter Folder Name" required={true}
                                           minLength="1"/>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button className="btn-primary create-btn" onClick={this.addFolder.bind(this)}>
                                        Create
                                    </Button>
                                </Modal.Footer>
                            </Modal>

                        </div>
                    </div>
                </div>
                <div className="row-fluid">
                    <div className="col-md-12">
                        <DocumentList location={location} open={this.openClick.bind(this)}/>
                        {   this.props.fetching && <img src="src/assets/fetching.gif" className="fetching-loader"/> }
                        <h3>&nbsp;</h3>
                    </div>
                </div>
            </div>
        );
    }

}
function mapStateToProps(state) {
    return {
        fetching: state.documents.fetching,
        fileAddSuccess: state.documents.fileAddSuccess,
        appName: state.documents.appName,
        appId: state.documents.appId,
        uploadingFile: state.uploadingFiles.file,
        uploadProgress: state.uploadingFiles.uploadProgress,
        uploadedFiles: state.uploadingFiles.uploadedFiles
    };
}
function matchDispatchToProps(dispatch) {
    return bindActionCreators({
        addFile: addFile,
        fetchAllFiles: fetchAllFiles,
        sortDocuments: sortDocuments
    }, dispatch);
}
export default connect(mapStateToProps, matchDispatchToProps)(MainBody);
