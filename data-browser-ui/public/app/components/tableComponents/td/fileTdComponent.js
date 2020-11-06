import React from 'react';
import ReactDOM from 'react-dom';
import LinearProgress from 'material-ui/LinearProgress';
import FilePicker from './filePicker'
import CONFIG from '../../../config/app.js'
import Axios from 'axios'
import ReactTooltip from 'react-tooltip'

class FileTdComponent extends React.Component {
	constructor() {
		super()
		this.state = {
			isModalOpen: false,
			file: {},
			isFilePickerOpen:false
		}
	}
	componentDidMount() {
		this.fetchImageFromCB(this.props)
	}
	componentWillReceiveProps(props) {
		this.fetchImageFromCB(props)
	}

	addFile(file) {
		this.setState({ file: file, isFilePickerOpen:false})
		this.props.updateElement(file)
		this.props.updateObject()
	}
	downloadFile() {
		if (!this.checkIfPrivateFile(this.state.file)) {
			// for public files
			let win = window.open(this.state.file.url, '_blank')
			win.focus()
		} else {
			// for private files
			Axios({
				method: 'post',
				data: {
					key: CB.appKey
				},
				url: this.state.file.url,
				withCredentials: false,
				responseType: 'blob'
			}).then(function (res) {
				var blob = res.data;
				saveAs(blob, this.state.file.name)
			}.bind(this), function (err) {
				console.log(err)
			})
		}
	}
	checkIfPrivateFile(file) {
		let fileACL = file.ACL.document || file.ACL
		return fileACL.read.allow.user.indexOf('all') === -1
	}
	deleteFile(permanent) {
		this.props.updateElement(null)
		this.props.updateObject()
		if(permanent){
			this.state.file.delete()
		}
		this.setState({
			file: {},
			isModalOpen:false
		})
	}
	fetchImageFromCB(props) {
		if (props.elementData) {
			props.elementData.fetch({
				success: function (file) {
					file = file || {}
					this.setState({ file: file })
					//received file Object
				}.bind(this), error: function (err) {
					//error in getting file Object
				}
			});
		}
	}
	getFileIcon(file) {
		if (file.type) {
			let fileType = file.type.split("/")[1]
			if (fileType) {
				if (['png', 'jpeg', 'jpg', 'gif'].indexOf(fileType) > -1) {
					return <img src={ this.checkIfPrivateFile(file) ? 'public/app/assets/images/file/file.png' : file.url } className={ this.checkIfPrivateFile(file) ? 'fsmimagenf' : 'fsmimage' } />
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
	getPreviewIcon(file) {
		if (file.type) {
			let fileType = file.type.split("/")[1]
			if (fileType) {
				if (['png', 'jpeg', 'jpg', 'gif'].indexOf(fileType) > -1) {
					return <img className={file.document ? 'previewSmallImage' : 'hide'} src={this.checkIfPrivateFile(file) ? 'public/app/assets/images/file/file.png' : file.url} />
				} else if (CONFIG.iconTypes.indexOf(fileType) > -1) {
					return <img src={"public/app/assets/images/file/" + fileType + ".png"} className={file.document ? 'previewSmallImage' : 'hide'} />
				} else {
					return <img className={file.document ? 'previewSmallImage' : 'hide'} src={'public/app/assets/images/file/file.png'} />
				}
			} else {
				return <img className={file.document ? 'previewSmallImage' : 'hide'} src={'public/app/assets/images/file/file.png'} />
			}
		}
	}
	cancelFileSave() {
		this.props.fetchObject()
		this.openCloseModal(false)
	}
	openCloseModal(what) {
		this.state.isModalOpen = what
		//open filepicker if no file is attachced
		if(what === true && !this.state.file.document){
			this.state.isModalOpen = false
			this.state.isFilePickerOpen = true
		}
		this.setState(this.state)
	}

	openCloseFilePicker(what){
		this.state.isFilePickerOpen = what
		this.setState(this.state)
	}
	render() {
		let requiredClass = this.props.isRequired ? " requiredred" : ""
		let dialogTitle = <div className="modaltitle">
			<span className="diadlogTitleText">File Editor</span>
			<i className='fa fa-paperclip iconmodal'></i>
		</div>
		return (
			<td className={'mdl-data-table__cell--non-numeric pointer' + requiredClass} onDoubleClick={this.openCloseModal.bind(this, true)}>
				<span className={this.state.file.document ? 'hide' : 'color888 expandleftpspan'}>Upload File</span>
				{this.getPreviewIcon(this.state.file)}
				<i className={this.state.file.document ? 'fa fa-expand fr expandCircle' : 'fa fa-expand fr expandCircle'} aria-hidden="true" onClick={this.openCloseModal.bind(this, true)}></i>

				{
					//open modal only when filepicker is closed and open modal is true
					this.state.isModalOpen && !this.state.isFilePickerOpen ? 
						<div className={this.state.isModalOpen ? 'fsmodal':'hide'}>
							<div className="fsmheading">
								<span className="filenamefsm">{this.state.file.name || ""}</span>
								<i className="ion-android-close closeiconfsm" onClick={this.cancelFileSave.bind(this, false)}></i>
							</div>
							{ this.getFileIcon(this.state.file) }
							<div className="fsmfooter">
								<i data-tip={ "Delete Permanently" } className="ion-ios-trash-outline deleteiconfsm" onClick={this.deleteFile.bind(this,true)}></i>
								<i data-tip={ "Delete Reference From CloudObject" } className="ion-android-remove-circle deleteiconfsm" onClick={this.deleteFile.bind(this,false)}></i>
								<i data-tip={ "Download" } className="ion-ios-download-outline downloadiconfsm" onClick={this.downloadFile.bind(this)}></i>
								<i data-tip={ "Edit" } className="ion-edit editiconfsm" onClick={this.openCloseFilePicker.bind(this,true)}></i>
							</div>
							<ReactTooltip place="top" border={true} offset={{top: 10, left: 10}}/>
						</div> : ''
				}

				{
					this.state.isFilePickerOpen ? 
						<FilePicker chooseFile={this.addFile.bind(this)} isFilePickerOpen={this.state.isFilePickerOpen} openCloseFilePicker={this.openCloseFilePicker.bind(this)}>
						</FilePicker> : ''
				}

			</td>
		);
	}
}

export default FileTdComponent;
