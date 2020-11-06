import React from 'react'
import { observer } from "mobx-react"
import { Popover, PopoverAnimationVertical } from 'material-ui/Popover'
import axios from 'axios'
import Dropzone from 'react-dropzone';
import DeleteTableComponent from '../tableComponents/deleteTableComponent';

@observer
class AdvanceOptions extends React.Component {
	constructor() {
		super()
		this.state = {
			open: false,
			progress: false,
			file: null,
			openDeleteConfirmDialog: false
		}
	}
	componentWillMount() {

	}
	toggleEditable(which, value) {
		this.props.tableStore.updateTableProperty(which, value)
		this.handleRequestClose()
	}
	handleTouchTap(event) {
		// This prevents ghost click.
		event.preventDefault();
		this.setState({
			open: true,
			anchorEl: event.currentTarget
		})
	}
	handleRequestClose() {
		this.setState({
			open: false
		})
	}
	exportTable(type) {
		this.setState({ progress: true })
		this.props.tableStore.exportTable(type).then((res) => {
			var blob = res.data;
			let fileNanme = 'cloudboost_' + res.tableName + '.' + type
			saveAs(blob, fileNanme)
			this.setState({ progress: false })
		}, (err) => {
			this.setState({ progress: false })
		})
	}
	onDrop(acceptedFiles, rejectedFiles) {
		const { location } = this.state;
		this.props.tableStore.uploadDocumentRequest(decodeURIComponent(window.location.pathname), acceptedFiles[0], null, null);
		this.state.tableName = null;
		this.state.open = false;
		this.setState(this.state);
	}

	close() {
		this.setState({ showUploadModal: false, showCreateModal: false });
	}
	open(type) {
		this.setState({
			showUploadModal: (type == 'upload'
				? true
				: false),
			showCreateModal: (type == 'upload'
				? false
				: true)
		});
	}

	changeHandler(which, e) {
		this.state[which] = e.target.value
		this.setState(this.state);
	}

	onOpenClick() {
		console.log(this.refs)
		this.refs.dropzone.open();
	}

	confirmDeleteTable(){
		this.setState({
			openDeleteConfirmDialog: true,
			open: false
		})
	}

	render() {
		let table = this.props.tableStore.columns
		let isEditableByClientKey = false
		if (table.document) {
			isEditableByClientKey = !!table.document.isEditableByClientKey
		}
		return (
			<div className="disinb">
				<button className={"btn subhbtnpop"} onTouchTap={this.handleTouchTap.bind(this)}><i className="fa fa-cog mr2" aria-hidden="true"></i>More</button>
				<Popover
					open={this.state.open}
					anchorEl={this.state.anchorEl}
					anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
					targetOrigin={{ horizontal: 'left', vertical: 'top' }}
					onRequestClose={this.handleRequestClose.bind(this)}
					animation={PopoverAnimationVertical}
					className="popupmore"
				>
					<div>
						<div className="advanceoptioncontainer cp" onClick={this.toggleEditable.bind(this, 'isEditableByClientKey', !isEditableByClientKey)}>
							<i className={isEditableByClientKey ? 'fa fa-toggle-on greentoggled' : 'fa fa-toggle-off offtoggled'} style={{ marginTop: 12 }}></i>
							<span>{'Is editable by Client Key ?'}</span>
							<span className="smalltextclientkey">{'It lets you view and edit the table schema using client key. If you’re running the app in production, We recommend you to turn this off.'}</span>
						</div>

						<div className="advanceoptioncontainerexport cp">
							<span>Export Table</span>
							<button onClick={this.exportTable.bind(this, 'csv')} disabled={this.state.progress} className="applyfiler exportbtn">CSV</button>
							<button onClick={this.exportTable.bind(this, 'xls')} disabled={this.state.progress} className="applyfiler exportbtn">XLS</button>
							<button onClick={this.exportTable.bind(this, 'json')} disabled={this.state.progress} className="applyfiler exportbtn">JSON</button>
						</div>

						<div className="advanceoptioncontainerexport cp">
							<span>Import Table</span>
							<Dropzone style={{height:"50px"}} ref="dropzone" onDrop={this.onDrop.bind(this)} className="upload-icon" location={this.state.location} disableClick={false}>
								<div className="addtablebutons" style={{marginRight: "15px", marginTop: "50px"}}>
									<button className="applyfiler applyfilter">
										<i className="fa fa-check plusaddfilter" aria-hidden="true"></i>
										Import File & Apply
									</button>
								</div>
							</Dropzone>
							<span style={{fontSize: "10px", marginTop: "-30px"}}>Note: This functionality is used to import data into a particular schema. <br/>Only '.csv', '.xls/.xlsx', '.json' are allowed. To get an idea for exact format, export one of your app's table.</span>
						</div>
						<div>
							{['User', 'Role', 'Device'].indexOf(this.props.tableStore.TABLE) == -1 ? <div className="btn subhbtn" onTouchTap={this.confirmDeleteTable.bind(this)}><i className="ion ion-ios-trash-outline trash-icon" aria-hidden="true"></i> Delete </div> : null }
						</div>
					</div>
				</Popover>
				{this.state.openDeleteConfirmDialog ?
					<DeleteTableComponent tableStore={this.props.tableStore}/>
					:
					null
				}
			</div>
		);
	}
}

export default AdvanceOptions;