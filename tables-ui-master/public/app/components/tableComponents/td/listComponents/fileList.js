import React from 'react';
import ReactDOM from 'react-dom';
import CONFIG from '../../../../config/app.js'
import Axios from 'axios'

class FileListComponent extends React.Component {
	constructor() {
		super()
		this.state = {
			filePreview: {},
			isModalOpen: false
		}
	}
	deleteValue() {
		this.props.removeFromElementData(this.props.index)
		this.openCloseModal(false)
	}
	componentDidMount() {
		// set mounted true for setstate check
		this._isMounted = true
		this.fetchImageFromCB(this.props)
	}
	componentWillReceiveProps(props) {
		this.fetchImageFromCB(props)
	}
	fetchImageFromCB(props) {
		if (props.data) {
			try {
				props.data.fetch({
					success: function (file) {
						file = file || {}
						this.state.filePreview = file
						if (this._isMounted) {
							this.setState(this.state)
						}
						//received file Object
					}.bind(this), error: function (err) {
						console.log(err)
						//error in getting file Object
					}
				});
			} catch (e) {
				console.log(e)
			}
		}
	}
	getPreviewIcon(file) {
		if (file.type) {
			let fileType = file.type.split("/")[1]
			if (fileType) {
				if (['png', 'jpeg', 'jpg', 'gif'].indexOf(fileType) > -1) {
					return <img className={file.document ? 'filelistpopprev cp' : 'hide'} src={this.checkIfPrivateFile(file) ? 'public/app/assets/images/file/file.png' : file.url} />
				} else if (CONFIG.iconTypes.indexOf(fileType) > -1) {
					return <img src={"public/app/assets/images/file/" + fileType + ".png"} className={file.document ? 'filelistpopprev cp' : 'hide'} />
				} else {
					return <img className={file.document ? 'filelistpopprev cp' : 'hide'} src={'public/app/assets/images/file/file.png'} />
				}
			} else {
				return <img className={file.document ? 'filelistpopprev cp' : 'hide'} src={'public/app/assets/images/file/file.png'} />
			}
		} else return <span className="nofilefoundref">This file was deleted.</span>
	}
	getFileIcon(file) {
		if (file.type) {
			let fileType = file.type.split("/")[1]
			if (fileType) {
				if (['png', 'jpeg', 'jpg', 'gif'].indexOf(fileType) > -1) {
					return <img src={this.checkIfPrivateFile(file) ? 'public/app/assets/images/file/file.png' : file.url} className={this.checkIfPrivateFile(file) || this.props.isListOfRelation ? 'fsmimagenf' : 'fsmimage'} />
				} else if (CONFIG.iconTypes.indexOf(fileType) > -1) {
					return <img src={"public/app/assets/images/file/" + fileType + ".png"} className="fsmimagenf" />
				} else {
					return <img src={"public/app/assets/images/file/file.png"} className="fsmimagenf" />
				}
			} else {
				return <img src={"public/app/assets/images/file/file.png"} className="fsmimagenf" />
			}
		}
	}
	downloadFile() {
		if (!this.checkIfPrivateFile(this.state.filePreview)) {
			// for public files
			let win = window.open(this.state.filePreview.url, '_blank')
			win.focus()
		} else {
			// for private files
			Axios({
				method: 'post',
				data: {
					key: CB.appKey
				},
				url: this.state.filePreview.url,
				withCredentials: false,
				responseType: 'blob'
			}).then(function (res) {
				var blob = res.data;
				saveAs(blob, this.state.filePreview.name)
			}.bind(this), function (err) {
				console.log(err)
			})
		}
	}
	checkIfPrivateFile(file) {
		let fileACL = file.ACL.document || file.ACL
		return fileACL.read.allow.user.indexOf('all') === -1
	}
	openCloseModal(what) {
		this.state.isModalOpen = what
		this.setState(this.state)
	}
	componentWillUnmount() {
		// set mounted false for setstate check
		this._isMounted = false
	}
	render() {
		let previewIcon = React.cloneElement((this.getPreviewIcon(this.state.filePreview) || <div />), {})
		return (
			<div>
				<div className="filelistpopoever" onClick={ this.state.filePreview.name ? this.openCloseModal.bind(this, true) : this.deleteValue.bind(this) }>
					{previewIcon}
					<p className="filenamepoplist">{this.state.filePreview.name || ''}</p>
				</div>
				<div className={this.state.isModalOpen ? 'fsmodal' : 'hide'}>
					<div className="fsmheading">
						<span className="filenamefsm">{this.state.filePreview.name || ""}</span>
						<i className="ion-android-close closeiconfsm" onClick={this.openCloseModal.bind(this, false)}></i>
					</div>
					{this.getFileIcon(this.state.filePreview)}
					<div className="fsmfooter">
						<i data-tip={"Delete"} className="ion-ios-trash-outline deleteiconfsm" onClick={this.deleteValue.bind(this)}></i>
						<i data-tip={"Download"} className="ion-ios-download-outline downloadiconfsm" onClick={this.downloadFile.bind(this)}></i>
					</div>
				</div>
			</div>
		);
	}
}

export default FileListComponent;