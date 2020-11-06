import React from 'react';
import { observer } from "mobx-react"
import {Checkbox,TextField} from 'material-ui'
import configObject from '../../config/app.js'
import {Popover, PopoverAnimationVertical} from 'material-ui/Popover'

@observer
class ColumnOptions extends React.Component {
	constructor(){
		super()
		this.state = {
			open: false,
			unique:false,
			required:false,
			columnName:''
		}
	}
	componentDidMount(){
		this.state.unique = this.props.columnData.unique
		this.state.required = this.props.columnData.required
		this.setState(this.state)
	}
	hideShowColumn(name,e){
		this.closeMenu()
		this.props.tableStore.hideColumn(name)
	}
	sortColumns(columnName,what){
		this.props.tableStore.sortColumnsData(what,columnName)
	}
	deleteColumn(columnName){
		this.closeMenu()
		this.props.tableStore.deleteColumn(columnName)
	}
	editColumn(columnName){
		this.props.tableStore.editColumn(columnName,this.state.unique,this.state.required,this.state.columnName)
		this.handleRequestClose()
	}
	closeMenu(){
		this.props.handleRequestClose()
	}
	handleTouchTap(event){
		// This prevents ghost click.
		event.preventDefault();
		this.setState({
		  open: true,
		  anchorEl: event.currentTarget
		})
	}
	handleRequestClose(){
		this.setState({
		  open: false
		})
	}
	checkHandler(which,e,data){
		this.state[which] = data
		this.setState(this.state)
	}
	changeHandler(which,e){
		this.state[which] = e.target.value
		this.setState(this.state)
	}
	render() {
		return (
			<div>
				<button 
					className={ ['Text','Email','Number','DateTime','Boolean'].indexOf(this.props.columnData.dataType) == -1 ? "hide" : "coloptbtn" }
					onClick={ this.sortColumns.bind(this,this.props.columnData.name,'orderByAsc') }>
					<i className="fa fa-sort-alpha-asc" aria-hidden="true"></i> 
					{' Sort Ascending'}
				</button>
				<button 
					className={ ['Text','Email','Number','DateTime','Boolean'].indexOf(this.props.columnData.dataType) == -1 ? "hide" : "coloptbtn" }
					onClick={ this.sortColumns.bind(this,this.props.columnData.name,'orderByDesc') }>
					<i className="fa fa-sort-alpha-desc" aria-hidden="true"></i> 
					{' Sort Descending'}
				</button>
	        	<button className="coloptbtn" onClick={ this.hideShowColumn.bind(this,this.props.columnData.name) }><i className="fa fa-eye-slash" aria-hidden="true"></i> Hide Column</button>
	        	<button 
	        		className={ this.props.columnData.isDeletable ? "coloptbtn" : 'hide' } 
	        		onClick={ this.deleteColumn.bind(this,this.props.columnData.name) }>
	        		<i className="fa fa-minus-circle" aria-hidden="true"></i> 
	        		{' Delete Column'}
	        	</button>
	        	<button
		        	className={ this.props.columnData.isEditable ? "coloptbtn" : 'hide' }
		        	onTouchTap={ this.handleTouchTap.bind(this) }>
		        	<i className="fa fa-wrench" aria-hidden="true"></i> 
		        	{' Configure Column'}
	        	</button>
	        	<Popover
		          open={this.state.open}
		          anchorEl={this.state.anchorEl}
		          anchorOrigin= {{"horizontal":"left","vertical":"bottom"}}
				  targetOrigin= {{"horizontal":"right","vertical":"top"}}
		          onRequestClose={this.handleRequestClose.bind(this)}
		          animated={false}
		          className="columnpop"
		        >
					<TextField
      				floatingLabelText="New Column Name"
					  className="new-column-textField" floatingLabelStyle={{lineHeight:0}} onChange={this.changeHandler.bind(this,'columnName')}
    				/>
					<Checkbox
				      label="Required"
				      className="checkeditcol"
				      checked={ this.state.required }
				      onCheck={ this.checkHandler.bind(this,'required') }
				    />
				    <Checkbox
				      label="Unique"
				      className="checkeditcol"
				      checked={ this.state.unique }
				      onCheck={ this.checkHandler.bind(this,'unique') }
				    />
				    <button className="savebtneditablecol" onClick={ this.editColumn.bind(this,this.props.columnData.name) }>Save</button>
		        </Popover>
	        </div>
		);
	}
}

export default ColumnOptions;