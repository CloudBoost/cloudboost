import React, {Component} from 'react'
import {observer} from "mobx-react"
import {Popover, PopoverAnimationVertical} from 'material-ui/Popover'
import Dialog from 'material-ui/Dialog';

@observer
class DeleteTableComponent extends Component{
    constructor(props){
        super(props);
        this.state = {
			open: true,
			isModalOpen: true,
			confirmDeleteValue: '',
			tableTodelete: this.props.tableStore.TABLE,
			openDeleteTable: true,
        }
	}
    
	handleRequestClose(which) {
		this.state[which] = false
		this.setState(this.state)
    }
    
    changeHandler(which, e) {
		let state = {};
		state[which] = e.target.value
		this.setState(state)
	}

	deleteTable() {
		this.props.tableStore.showLoader()
		this.props.tableStore.deleteTable(this.state.tableTodelete)
		
		this.setState({
			openDeleteTable: false,
			tableTodelete: '',
			isModalOpen: false,
			confirmDeleteValue: ''			
		})
	}
	openCloseModal(what) {
		this.handleRequestClose('openDeleteTable')
		this.setState({ isModalOpen: what, confirmDeleteValue: '' })
	}

    render(){
		return (
			<div id="dataSubHeader">
				<Dialog title="Delete Confirmation" modal={false} open={this.state.isModalOpen} onRequestClose={this.openCloseModal.bind(this, false)} titleClassName="deletemodal" contentClassName={"contentclassdeletemodal"}>
					<p className="deleteconfirmtext">Please confirm that you want to delete this table, by entering the table name i.e. {this.state.tableTodelete} </p>
					<input className="deleteconfirminput" value={this.state.confirmDeleteValue} onChange={this.changeHandler.bind(this, 'confirmDeleteValue')} />
					<button className="btn btn-danger fr mt10" onClick={this.deleteTable.bind(this)} disabled={this.state.confirmDeleteValue != this.state.tableTodelete}>Delete</button>
				</Dialog>
			</div>
		
		)
    }
}

export default DeleteTableComponent;